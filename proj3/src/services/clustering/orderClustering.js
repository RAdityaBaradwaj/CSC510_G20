// Detour-based clustering using travel time; prefers real Google Directions API when available.
import axios from 'axios'
import { distanceCalculator } from '../../utils/distanceCalculator'

const AVERAGE_SPEED_KMH = 35 // fallback street speed for detour estimate
const DETOUR_MINUTES_THRESHOLD = 3

/**
 * Cluster orders by checking whether adding an order is <3 minutes detour off the current route.
 * Approximates route as a line from pickup -> dropoff for the seed order, then folds in nearby
 * orders if the detour is below the threshold. Repeats for remaining orders/drivers.
 */
export async function clusterOrders(orders, drivers, maxOrdersPerBatch = 10) {
  if (!orders || orders.length === 0 || !drivers || drivers.length === 0) return []

  const availableDrivers = drivers.filter(d => d.isAvailable && d.isAvailable() && d.currentLocation)
  if (availableDrivers.length === 0) return []

  const remainingOrders = [...orders]
  const batches = []

  for (const driver of availableDrivers) {
    if (remainingOrders.length === 0) break

    const driverBatches = await buildBatchesForDriver(driver, remainingOrders, maxOrdersPerBatch)
    batches.push(...driverBatches.assigned)
    // Remove assigned orders from remainingOrders
    driverBatches.assignedOrderIds.forEach(id => {
      const idx = remainingOrders.findIndex(o => o.id === id)
      if (idx !== -1) remainingOrders.splice(idx, 1)
    })
  }

  return batches
}

async function buildBatchesForDriver(driver, orders, maxOrdersPerBatch) {
  const assigned = []
  const assignedOrderIds = []
  const localOrders = [...orders]

  while (localOrders.length > 0 && (!driver.isBusy || !driver.isBusy())) {
    // Seed with order that has the longest pickup->drop distance
    const seedIndex = findLongestLegIndex(localOrders)
    if (seedIndex === -1) break
    const seed = localOrders.splice(seedIndex, 1)[0]
    const pickup = getPickup(seed)
    const drop = getDrop(seed)
    if (!pickup || !drop) continue

    const route = [pickup, drop]
    const batchOrders = [seed]

    // Try to add orders with <3 minute detour
    for (let i = localOrders.length - 1; i >= 0 && batchOrders.length < maxOrdersPerBatch; i--) {
      const candidate = localOrders[i]
      const candidatePickup = getPickup(candidate)
      const candidateDrop = getDrop(candidate)
      if (!candidatePickup || !candidateDrop) continue

      const detourMinutes = await estimateDetourMinutes(route, candidatePickup, candidateDrop)
      if (detourMinutes <= DETOUR_MINUTES_THRESHOLD) {
        batchOrders.push(candidate)
        localOrders.splice(i, 1)
      }
    }

    assignedOrderIds.push(...batchOrders.map(o => o.id))
    assigned.push({
      driverId: driver.id,
      driverName: driver.name,
      orders: batchOrders,
      totalOrders: batchOrders.length
    })
  }

  return { assigned, assignedOrderIds }
}

function findLongestLegIndex(orders) {
  let longest = -1
  let index = -1
  orders.forEach((order, idx) => {
    const pickup = getPickup(order)
    const drop = getDrop(order)
    if (!pickup || !drop) return
    const dist = distanceCalculator.calculateDistance(pickup.lat, pickup.lng, drop.lat, drop.lng)
    if (dist > longest) {
      longest = dist
      index = idx
    }
  })
  return index
}

function getPickup(order) {
  const candidate = order.pickupLocation || order.businessLocation || order.storeLocation || order.location || null
  if (!candidate) return null
  if (typeof candidate.lat !== 'number' || typeof candidate.lng !== 'number') return null
  return candidate
}

function getDrop(order) {
  const candidate = order.deliveryLocation || order.dropoffLocation || order.location || null
  if (!candidate) return null
  if (typeof candidate.lat !== 'number' || typeof candidate.lng !== 'number') return null
  return candidate
}

async function estimateDetourMinutes(route, pickup, drop) {
  // Simple model: detour = time to hop off route to pickup + drop and return to route line
  // Use Google Directions API if key is available; otherwise fallback to haversine + avg speed.
  const directMinutes = await travelMinutes(route[0], route[route.length - 1])
  const withDetour = await travelMinutes(route[0], pickup) +
    await travelMinutes(pickup, drop) +
    await travelMinutes(drop, route[route.length - 1])
  return Math.max(0, withDetour - directMinutes)
}

async function travelMinutes(a, b) {
  if (!a || !b) return Infinity
  const key = typeof process !== 'undefined' ? process.env.GOOGLE_MAPS_API_KEY : undefined
  if (key) {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${a.lat},${a.lng}&destination=${b.lat},${b.lng}&key=${key}&mode=driving`
      const res = await axios.get(url)
      const seconds = res.data?.routes?.[0]?.legs?.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0) || null
      if (seconds) return seconds / 60
    } catch (err) {
      // Fall through to haversine
    }
  }
  const km = distanceCalculator.calculateDistance(a.lat, a.lng, b.lat, b.lng)
  return (km / AVERAGE_SPEED_KMH) * 60
}

/**
 * Optimize route for a batch of orders using nearest neighbor algorithm
 * @param {Array} orders - Array of Order objects
 * @param {Object} driverLocation - { lat, lng } starting point
 * @returns {Array} Optimized route array of { lat, lng, orderId, address }
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

  if (!driverLocation && !startLocation && pickups.length === 0) {
    return dropoffs
  }

  // Start at first pickup (if available), else startLocation/driverLocation
  const route = []
  const remainingPickups = [...pickups]
  let currentLocation = startLocation || remainingPickups[0] || driverLocation || dropoffs[0]

  if (remainingPickups.length > 0) {
    // Force first pickup as start
    const firstPickup = remainingPickups.shift()
    route.push({ ...firstPickup, distance: 0 })
    currentLocation = { lat: firstPickup.lat, lng: firstPickup.lng }
  }

  // Nearest neighbor through remaining pickups
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

  // Then nearest neighbor through dropoffs
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
