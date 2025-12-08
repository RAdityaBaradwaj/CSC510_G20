// Route-aware, detour-based clustering for pickups + dropoffs.
// We build batches by inserting each order's pickup and dropoff into a growing route
// and accept the order only if the added detour stays below a small threshold.
// This lets us batch errands that are "on the way" even when raw distances are large.

import { distanceCalculator } from '../../utils/distanceCalculator'

// Max extra distance (in km) we allow when inserting a new pickup+dropoff into a batch.
const MAX_DETOUR_KM = 3

/**
 * Cluster orders for available drivers using a detour-based insertion heuristic.
 * @param {Array} orders - orders with pickupLocation/businessLocation and customer location
 * @param {Array} drivers - drivers (needs currentLocation and isAvailable())
 * @param {number} maxOrdersPerBatch - optional cap per batch
 * @returns {Array} batches: [{ driverId, driverName, orders, totalOrders, totalDistance, route }]
 */
export async function clusterOrders(orders, drivers, maxOrdersPerBatch = 10) {
  if (!orders || orders.length === 0 || !drivers || drivers.length === 0) return []

  const availableDrivers = drivers.filter(d => d.isAvailable && d.isAvailable())
  if (availableDrivers.length === 0) return []

  const remainingOrders = [...orders]
  const batches = []

  for (const driver of availableDrivers) {
    if (remainingOrders.length === 0) break

    const { assigned, assignedOrderIds } = buildBatchesForDriver(driver, remainingOrders, maxOrdersPerBatch)
    batches.push(...assigned)

    // Remove assigned orders from pool
    assignedOrderIds.forEach(id => {
      const idx = remainingOrders.findIndex(o => o.id === id)
      if (idx !== -1) remainingOrders.splice(idx, 1)
    })
  }

  return batches
}

function buildBatchesForDriver(driver, orders, maxOrdersPerBatch) {
  const assigned = []
  const assignedOrderIds = []
  const pool = [...orders]

  while (pool.length > 0 && (!driver.isBusy || !driver.isBusy())) {
    // Seed batch with the next available order (could choose longest leg; first is fine for MVP).
    const seed = pool.shift()
    const seedPickup = getPickup(seed)
    const seedDrop = getDrop(seed)
    if (!seedPickup || !seedDrop) continue

    let route = [
      { ...seedPickup, type: 'pickup', orderId: seed.id },
      { ...seedDrop, type: 'dropoff', orderId: seed.id }
    ]
    const batchOrders = [seed]

    let addedSomething = true
    while (addedSomething && batchOrders.length < maxOrdersPerBatch && pool.length > 0) {
      addedSomething = false
      let bestCandidate = null
      let bestRoute = null
      let bestDetour = Infinity

      for (const candidate of pool) {
        const pickup = getPickup(candidate)
        const drop = getDrop(candidate)
        if (!pickup || !drop) continue

        const insertion = findBestInsertion(route, pickup, drop, driver.currentLocation, candidate.id)
        if (insertion && insertion.detour < bestDetour) {
          bestDetour = insertion.detour
          bestRoute = insertion.route
          bestCandidate = candidate
        }
      }

      if (bestCandidate && bestDetour <= MAX_DETOUR_KM) {
        // Accept candidate into this batch
        route = bestRoute
        batchOrders.push(bestCandidate)
        const removeIdx = pool.findIndex(o => o.id === bestCandidate.id)
        if (removeIdx !== -1) pool.splice(removeIdx, 1)
        addedSomething = true
      }
    }

    const totalDistance = computeRouteDistance(route, driver.currentLocation)
    assignedOrderIds.push(...batchOrders.map(o => o.id))
    assigned.push({
      driverId: driver.id,
      driverName: driver.name,
      orders: batchOrders,
      totalOrders: batchOrders.length,
      totalDistance,
      route
    })
  }

  return { assigned, assignedOrderIds }
}

/**
 * Find the minimal detour way to insert pickup+dropoff into an existing route
 * while preserving pickup-before-dropoff.
 */
function findBestInsertion(route, pickup, drop, startLocation, orderId) {
  const currentDistance = computeRouteDistance(route, startLocation)
  let bestRoute = null
  let bestDetour = Infinity

  // pickupIndex can be at any position in [0, route.length]
  for (let pIdx = 0; pIdx <= route.length; pIdx++) {
    // dropoff must come after pickup
    for (let dIdx = pIdx + 1; dIdx <= route.length + 1; dIdx++) {
      const newRoute = [
        ...route.slice(0, pIdx),
        { ...pickup, type: 'pickup', orderId },
        ...route.slice(pIdx, dIdx - 1),
        { ...drop, type: 'dropoff', orderId },
        ...route.slice(dIdx - 1)
      ]
      const newDistance = computeRouteDistance(newRoute, startLocation)
      const detour = newDistance - currentDistance
      if (detour < bestDetour) {
        bestDetour = detour
        bestRoute = newRoute
      }
    }
  }

  if (!bestRoute || !isFinite(bestDetour)) return null
  return { route: bestRoute, detour: bestDetour }
}

function computeRouteDistance(route, startLocation = null) {
  if (!route || route.length === 0) return 0
  let total = 0
  let prev = startLocation || route[0]

  for (const node of route) {
    if (prev && node && prev.lat !== undefined && node.lat !== undefined) {
      total += distanceCalculator.calculateDistance(prev.lat, prev.lng, node.lat, node.lng)
    }
    prev = node
  }
  return total
}

function getPickup(order) {
  const candidate = order.pickupLocation || order.businessLocation || order.storeLocation || order.location || null
  if (!candidate || typeof candidate.lat !== 'number' || typeof candidate.lng !== 'number') return null
  return candidate
}

function getDrop(order) {
  const candidate = order.deliveryLocation || order.dropoffLocation || order.location || null
  if (!candidate || typeof candidate.lat !== 'number' || typeof candidate.lng !== 'number') return null
  return candidate
}

/**
 * Optimize route for a batch of orders using nearest neighbor heuristic
 * while ensuring pickups precede their dropoffs.
 */
export function optimizeRoute(orders, driverLocation, startLocation) {
  if (!orders || orders.length === 0) return []

  const pickups = []
  const dropoffs = []
  orders.forEach(order => {
    const pickup = order.pickupLocation || order.businessLocation || order.storeLocation
    if (pickup?.lat && pickup?.lng) {
      pickups.push({ ...pickup, orderId: order.id, type: 'pickup' })
    }
    const drop = order.location || order.deliveryLocation
    if (drop?.lat && drop?.lng) {
      dropoffs.push({ ...drop, orderId: order.id, type: 'dropoff' })
    }
  })

  // Start with first pickup (or provided start) then nearest neighbor through pickups, then dropoffs.
  const route = []
  const remainingPickups = [...pickups]
  let currentLocation = startLocation || remainingPickups[0] || driverLocation || dropoffs[0]

  if (remainingPickups.length > 0) {
    const firstPickup = remainingPickups.shift()
    route.push({ ...firstPickup, distance: 0 })
    currentLocation = { lat: firstPickup.lat, lng: firstPickup.lng }
  }

  while (remainingPickups.length > 0) {
    let nearestIndex = 0
    let nearestDistance = Infinity
    for (let i = 0; i < remainingPickups.length; i++) {
      const stop = remainingPickups[i]
      const distance = distanceCalculator.calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        stop.lat,
        stop.lng
      )
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }
    const nearest = remainingPickups.splice(nearestIndex, 1)[0]
    route.push({ ...nearest, distance: nearestDistance })
    currentLocation = { lat: nearest.lat, lng: nearest.lng }
  }

  const remainingDrops = [...dropoffs]
  while (remainingDrops.length > 0) {
    let nearestIndex = 0
    let nearestDistance = Infinity
    for (let i = 0; i < remainingDrops.length; i++) {
      const stop = remainingDrops[i]
      const distance = distanceCalculator.calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        stop.lat,
        stop.lng
      )
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }
    const nearest = remainingDrops.splice(nearestIndex, 1)[0]
    route.push({ ...nearest, distance: nearestDistance })
    currentLocation = { lat: nearest.lat, lng: nearest.lng }
  }

  return route
}

export default {
  clusterOrders,
  optimizeRoute
}
