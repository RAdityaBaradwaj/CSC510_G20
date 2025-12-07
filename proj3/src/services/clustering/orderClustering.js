// Order Clustering Algorithm - Groups orders by distance from drivers
// Uses K-means inspired clustering with distance optimization

import { distanceCalculator } from '../../utils/distanceCalculator'

/**
 * Cluster orders optimally based on distance from driver locations
 * Uses a greedy algorithm to minimize total delivery distance
 * 
 * @param {Array} orders - Array of Order objects
 * @param {Array} drivers - Array of Driver objects with currentLocation
 * @param {number} maxOrdersPerBatch - Maximum orders per batch (default: 10)
 * @param {number} maxDistanceKm - Maximum distance from driver to order (default: 20km)
 * @returns {Array} Array of batch configurations { driverId, orders: [...], totalDistance }
 */
export function clusterOrders(orders, drivers, maxOrdersPerBatch = 10, maxDistanceKm = 20) {
  if (!orders || orders.length === 0) return []
  if (!drivers || drivers.length === 0) return []

  // Filter to only available drivers
  const availableDrivers = drivers.filter(d => d.isAvailable() && d.currentLocation)
  
  if (availableDrivers.length === 0) return []

  // Group orders by location (zip code) first to batch same-location orders together
  const ordersByLocation = {}
  orders.forEach(order => {
    const orderLocation = order.location || order.deliveryLocation
    if (!orderLocation || !orderLocation.zipCode) return
    
    const locationKey = orderLocation.zipCode
    if (!ordersByLocation[locationKey]) {
      ordersByLocation[locationKey] = []
    }
    ordersByLocation[locationKey].push(order)
  })

  // Create batches for each driver
  const batches = []
  const unassignedOrders = [...orders]

  // For each driver, find orders within their service area
  for (const driver of availableDrivers) {
    const driverOrders = []

    // Prioritize orders from same locations (batch them together)
    // First, try to fill batch with orders from same zip codes
    for (const [zipCode, locationOrders] of Object.entries(ordersByLocation)) {
      if (!driver.servesZipCode(zipCode)) continue
      if (driverOrders.length >= maxOrdersPerBatch) break

      // Take orders from this location up to batch limit
      for (let i = locationOrders.length - 1; i >= 0 && driverOrders.length < maxOrdersPerBatch; i--) {
        const order = locationOrders[i]
        const orderIndex = unassignedOrders.findIndex(o => o.id === order.id)
        if (orderIndex === -1) continue // Already assigned

        const orderLocation = order.location || order.deliveryLocation
        if (!orderLocation || !orderLocation.lat || !orderLocation.lng) continue

        // Calculate distance from driver to order
        const distance = distanceCalculator.calculateDistance(
          driver.currentLocation.lat,
          driver.currentLocation.lng,
          orderLocation.lat,
          orderLocation.lng
        )

        // Check if within max distance
        if (distance <= maxDistanceKm) {
          driverOrders.push({
            order,
            distance
          })
          unassignedOrders.splice(orderIndex, 1) // Remove from unassigned
          locationOrders.splice(i, 1) // Remove from location group
        }
      }
    }

    // Then fill remaining slots with nearby orders from different locations
    for (let i = unassignedOrders.length - 1; i >= 0 && driverOrders.length < maxOrdersPerBatch; i--) {
      const order = unassignedOrders[i]
      
      // Get order location (handle both location and deliveryLocation)
      const orderLocation = order.location || order.deliveryLocation
      if (!orderLocation || !orderLocation.zipCode || !orderLocation.lat || !orderLocation.lng) {
        continue // Skip invalid orders
      }
      
      // Check if driver serves this zip code
      if (!driver.servesZipCode(orderLocation.zipCode)) continue

      // Calculate distance from driver to order
      const distance = distanceCalculator.calculateDistance(
        driver.currentLocation.lat,
        driver.currentLocation.lng,
        orderLocation.lat,
        orderLocation.lng
      )

      // Check if within max distance
      if (distance <= maxDistanceKm) {
        driverOrders.push({
          order,
          distance
        })
        unassignedOrders.splice(i, 1) // Remove from unassigned
      }
    }

    // If driver has orders, create a batch
    if (driverOrders.length > 0) {
      // Sort orders by distance (closest first) for optimal route
      driverOrders.sort((a, b) => a.distance - b.distance)

      // Calculate total distance (simplified: sum of distances from driver)
      // In production, you'd use a route optimization algorithm here
      const totalDistance = driverOrders.reduce((sum, item) => sum + item.distance, 0)

      batches.push({
        driverId: driver.id,
        driverName: driver.name,
        orders: driverOrders.map(item => item.order),
        totalDistance: totalDistance,
        averageDistance: totalDistance / driverOrders.length
      })
    }
  }

  // Handle remaining unassigned orders - try to assign to nearest driver
  for (const order of unassignedOrders) {
    const orderLocation = order.location || order.deliveryLocation
    if (!orderLocation || !orderLocation.lat || !orderLocation.lng) {
      continue // Skip invalid orders
    }

    let bestDriver = null
    let bestDistance = Infinity

    for (const driver of availableDrivers) {
      if (!driver.currentLocation) continue

      const distance = distanceCalculator.calculateDistance(
        driver.currentLocation.lat,
        driver.currentLocation.lng,
        orderLocation.lat,
        orderLocation.lng
      )

      // Prefer drivers who serve this zip code
      const servesZip = orderLocation.zipCode ? driver.servesZipCode(orderLocation.zipCode) : false
      const adjustedDistance = servesZip ? distance : distance * 1.5 // Penalty for non-serving drivers

      if (adjustedDistance < bestDistance && adjustedDistance <= maxDistanceKm * 1.5) {
        bestDistance = adjustedDistance
        bestDriver = driver
      }
    }

    if (bestDriver) {
      // Find or create batch for this driver
      let batch = batches.find(b => b.driverId === bestDriver.id)
      
      if (!batch) {
        batch = {
          driverId: bestDriver.id,
          driverName: bestDriver.name,
          orders: [],
          totalDistance: 0,
          averageDistance: 0
        }
        batches.push(batch)
      }

      // Add order if batch isn't full
      if (batch.orders.length < maxOrdersPerBatch) {
        batch.orders.push(order)
        batch.totalDistance += bestDistance
        batch.averageDistance = batch.totalDistance / batch.orders.length
      }
    }
  }

  // Sort batches by average distance (more efficient batches first)
  batches.sort((a, b) => a.averageDistance - b.averageDistance)

  return batches
}

/**
 * Optimize route for a batch of orders using nearest neighbor algorithm
 * @param {Array} orders - Array of Order objects
 * @param {Object} driverLocation - { lat, lng } starting point
 * @returns {Array} Optimized route array of { lat, lng, orderId, address }
 */
export function optimizeRoute(orders, driverLocation) {
  if (!orders || orders.length === 0) return []
  if (!driverLocation) return orders.map(o => {
    const orderLocation = o.location || o.deliveryLocation
    return {
      lat: orderLocation?.lat,
      lng: orderLocation?.lng,
      orderId: o.id,
      address: orderLocation?.address
    }
  }).filter(p => p.lat && p.lng)

  const route = []
  const unvisited = [...orders]
  let currentLocation = driverLocation

  // Nearest neighbor algorithm
  while (unvisited.length > 0) {
    let nearestIndex = 0
    let nearestDistance = Infinity

    for (let i = 0; i < unvisited.length; i++) {
      const order = unvisited[i]
      const orderLocation = order.location || order.deliveryLocation
      if (!orderLocation || !orderLocation.lat || !orderLocation.lng) {
        continue
      }
      
      const distance = distanceCalculator.calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        orderLocation.lat,
        orderLocation.lng
      )

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }

    const nearestOrder = unvisited.splice(nearestIndex, 1)[0]
    const nearestOrderLocation = nearestOrder.location || nearestOrder.deliveryLocation
    route.push({
      lat: nearestOrderLocation.lat,
      lng: nearestOrderLocation.lng,
      orderId: nearestOrder.id,
      address: nearestOrderLocation.address,
      distance: nearestDistance
    })

    currentLocation = {
      lat: nearestOrderLocation.lat,
      lng: nearestOrderLocation.lng
    }
  }

  return route
}

export default {
  clusterOrders,
  optimizeRoute
}

