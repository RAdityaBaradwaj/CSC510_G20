// Pooling Service for Order Pooling
import { Pool, POOL_STATUS } from '../../models/Pool'
import { orderService } from '../orders/orderService'
import { distanceCalculator } from '../../utils/distanceCalculator'

// Mock pools data
const mockPools = []

// Helper function to check if mock API should be used
const useMockAPI = () => {
  return process.env.VITE_USE_MOCK_DATA !== 'false'
}

// Simple route optimization using nearest neighbor heuristic
const optimizeRoute = (startLocation, orders) => {
  if (!startLocation || !orders || orders.length === 0) {
    return null
  }

  const waypoints = []
  const remainingOrders = [...orders]
  let currentLocation = { lat: startLocation.lat, lng: startLocation.lng }

  // Build route using nearest neighbor
  while (remainingOrders.length > 0) {
    let nearestIndex = 0
    let nearestDistance = Infinity

    remainingOrders.forEach((order, index) => {
      const orderLocation = order.location || order.deliveryLocation
      if (orderLocation && orderLocation.lat && orderLocation.lng) {
        const distance = distanceCalculator.calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          orderLocation.lat,
          orderLocation.lng
        )
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = index
        }
      }
    })

    const nextOrder = remainingOrders[nearestIndex]
    const orderLocation = nextOrder.location || nextOrder.deliveryLocation
    waypoints.push({
      orderId: nextOrder.id,
      orderAddress: orderLocation?.address || 'Unknown',
      location: orderLocation,
      distance: nearestDistance
    })

    currentLocation = { lat: orderLocation.lat, lng: orderLocation.lng }
    remainingOrders.splice(nearestIndex, 1)
  }

  // Calculate total distance
  const totalDistance = waypoints.reduce((sum, wp) => sum + (wp.distance || 0), 0)
  
  // Estimate time (assuming 30 km/h average speed)
  const estimatedTime = Math.ceil((totalDistance / 30) * 60) // minutes

  return {
    waypoints,
    totalDistance,
    estimatedTime,
    tolls: false,
    trafficConsideration: false
  }
}

// Calculate pool cost and savings
const calculateCosts = (pool, optimizedRoute) => {
  // Base cost for pooled delivery
  const baseCost = 5.00 // $5 base fee
  const distanceRate = 0.50 // $0.50 per km
  
  const pooledCost = baseCost + (distanceRate * optimizedRoute.totalDistance)
  
  // Estimate individual costs
  const individualCost = 8.00 // $8 per individual delivery
  const individualCosts = pool.orders.length * individualCost
  
  const savings = Math.max(0, individualCosts - pooledCost)

  return {
    pooledCost: Math.round(pooledCost * 100) / 100,
    individualCosts,
    savings: Math.round(savings * 100) / 100
  }
}

export const poolingService = {
  // Get all pools
  getAllPools: async (filters = {}) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 300))
      let pools = mockPools.map(pool => Pool.fromAPIResponse(pool))
      
      // Apply filters
      if (filters.status) {
        pools = pools.filter(p => p.status === filters.status)
      }
      if (filters.driverId) {
        pools = pools.filter(p => p.driverId === filters.driverId)
      }
      
      return pools
    } else {
      // Real API call
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.get(endpoints.pools.list(), { params: filters })
      return response.map(pool => Pool.fromAPIResponse(pool))
    }
  },

  // Get pool by ID
  getPoolById: async (poolId) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const pool = mockPools.find(p => p.id === poolId)
      if (!pool) {
        throw new Error('Pool not found')
      }
      return Pool.fromAPIResponse(pool)
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.get(endpoints.pools.detail(poolId))
      return Pool.fromAPIResponse(response)
    }
  },

  // Create new pool
  createPool: async (poolData) => {
    if (!poolData.orders || poolData.orders.length < 2) {
      throw new Error('Pool must contain at least 2 orders')
    }

    if (!poolData.startLocation) {
      throw new Error('Start location is required')
    }

    // Optimize route
    const optimizedRoute = optimizeRoute(poolData.startLocation, poolData.orders)
    
    if (!optimizedRoute) {
      throw new Error('Could not optimize route')
    }

    // Create pool
    const newPool = new Pool({
      ...poolData,
      id: `POOL-${Date.now()}`,
      optimizedRoute,
      estimatedDistance: optimizedRoute.totalDistance,
      estimatedTime: optimizedRoute.estimatedTime,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Calculate costs
    const costs = calculateCosts(newPool, optimizedRoute)
    newPool.cost = costs.pooledCost
    newPool.savings = costs.savings

    // Validate pool
    const validation = newPool.validate()
    if (!validation.isValid) {
      throw new Error(`Pool validation failed: ${validation.errors.join(', ')}`)
    }

    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 500))
      mockPools.push(newPool.toJSON())
      return newPool
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.post(endpoints.pools.list(), newPool.toJSON())
      return Pool.fromAPIResponse(response)
    }
  },

  // Update pool
  updatePool: async (poolId, updates) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const poolIndex = mockPools.findIndex(p => p.id === poolId)
      if (poolIndex === -1) {
        throw new Error('Pool not found')
      }

      mockPools[poolIndex] = {
        ...mockPools[poolIndex],
        ...updates,
        updatedAt: new Date()
      }
      return Pool.fromAPIResponse(mockPools[poolIndex])
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.put(endpoints.pools.detail(poolId), updates)
      return Pool.fromAPIResponse(response)
    }
  },

  // Delete pool
  deletePool: async (poolId) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const poolIndex = mockPools.findIndex(p => p.id === poolId)
      if (poolIndex === -1) {
        throw new Error('Pool not found')
      }

      mockPools.splice(poolIndex, 1)
      return true
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      await api.delete(endpoints.pools.detail(poolId))
      return true
    }
  },

  // Add orders to pool
  addOrdersToPool: async (poolId, orderIds) => {
    const pool = await poolingService.getPoolById(poolId)
    
    // Get orders
    const orders = await Promise.all(
      orderIds.map(id => orderService.getOrderById(id))
    )

    // Check if each order can be added
    for (const order of orders) {
      const check = pool.canAddOrder(order)
      if (!check.canAdd) {
        throw new Error(`Cannot add order ${order.id}: ${check.reason}`)
      }
    }

    // Add orders
    pool.orders.push(...orders)

    // Re-optimize route
    const optimizedRoute = optimizeRoute(pool.startLocation, pool.orders)
    if (optimizedRoute) {
      pool.optimizedRoute = optimizedRoute
      pool.estimatedDistance = optimizedRoute.totalDistance
      pool.estimatedTime = optimizedRoute.estimatedTime

      // Recalculate costs
      const costs = calculateCosts(pool, optimizedRoute)
      pool.cost = costs.pooledCost
      pool.savings = costs.savings
    }

    return poolingService.updatePool(poolId, pool.toJSON())
  },

  // Remove order from pool
  removeOrderFromPool: async (poolId, orderId) => {
    const pool = await poolingService.getPoolById(poolId)
    pool.removeOrder(orderId)

    // Check if pool still has enough orders
    if (pool.orders.length < 2) {
      throw new Error('Pool must contain at least 2 orders. Consider deleting the pool instead.')
    }

    // Re-optimize route
    const optimizedRoute = optimizeRoute(pool.startLocation, pool.orders)
    if (optimizedRoute) {
      pool.optimizedRoute = optimizedRoute
      pool.estimatedDistance = optimizedRoute.totalDistance
      pool.estimatedTime = optimizedRoute.estimatedTime

      // Recalculate costs
      const costs = calculateCosts(pool, optimizedRoute)
      pool.cost = costs.pooledCost
      pool.savings = costs.savings
    }

    return poolingService.updatePool(poolId, pool.toJSON())
  },

  // Assign driver
  assignDriver: async (poolId, driverId, driverName) => {
    return poolingService.updatePool(poolId, {
      driverId,
      driverName,
      updatedAt: new Date()
    })
  },

  // Start delivery
  startDelivery: async (poolId) => {
    const pool = await poolingService.getPoolById(poolId)
    const check = pool.canStart()
    
    if (!check.canStart) {
      throw new Error(check.reason)
    }

    return poolingService.updatePool(poolId, {
      status: POOL_STATUS.IN_PROGRESS,
      updatedAt: new Date()
    })
  },

  // Complete delivery
  completeDelivery: async (poolId) => {
    const pool = await poolingService.getPoolById(poolId)
    
    if (pool.status !== POOL_STATUS.IN_PROGRESS) {
      throw new Error('Can only complete pools that are in progress')
    }

    // Update all orders in pool
    for (const order of pool.orders) {
      await orderService.updateOrderStatus(order.id, 'delivered')
    }

    return poolingService.updatePool(poolId, {
      status: POOL_STATUS.COMPLETED,
      updatedAt: new Date()
    })
  },

  // Get pool suggestions
  getSuggestions: async (location, radius = 10, maxSuggestions = 5) => {
    if (!location) {
      throw new Error('Location is required')
    }

    // Get nearby pending orders
    const orders = await orderService.getNearbyOrders(location, radius, {
      status: 'pending'
    })

    if (orders.length < 2) {
      return []
    }

    // Simple suggestion algorithm: group nearby orders
    const suggestions = []
    const usedOrders = new Set()

    for (let i = 0; i < orders.length; i++) {
      if (usedOrders.has(orders[i].id)) continue

      const pool = [orders[i]]
      usedOrders.add(orders[i].id)

      // Find nearby orders
      for (let j = i + 1; j < orders.length && pool.length < 5; j++) {
        if (usedOrders.has(orders[j].id)) continue

        const distance = distanceCalculator.calculateDistance(
          orders[i].location?.lat || orders[i].deliveryLocation?.lat,
          orders[i].location?.lng || orders[i].deliveryLocation?.lng,
          orders[j].location?.lat || orders[j].deliveryLocation?.lat,
          orders[j].location?.lng || orders[j].deliveryLocation?.lng
        )

        // Group orders within 3km of each other
        if (distance <= 3) {
          pool.push(orders[j])
          usedOrders.add(orders[j].id)
        }
      }

      if (pool.length >= 2) {
        // Calculate potential savings
        const optimizedRoute = optimizeRoute(location, pool)
        const poolProto = new Pool({
          id: `temp-${i}`,
          name: `Suggested Pool ${i + 1}`,
          orders: pool,
          startLocation: location
        })
        const costs = calculateCosts(poolProto, optimizedRoute)

        suggestions.push({
          orders: pool,
          estimatedDistance: optimizedRoute.totalDistance,
          estimatedTime: optimizedRoute.estimatedTime,
          potentialSavings: costs.savings,
          confidence: pool.length >= 3 ? 'high' : 'medium'
        })
      }
    }

    // Sort by potential savings
    suggestions.sort((a, b) => b.potentialSavings - a.potentialSavings)

    return suggestions.slice(0, maxSuggestions)
  },

  // Optimize route for pool
  optimizePoolRoute: async (poolId) => {
    const pool = await poolingService.getPoolById(poolId)
    
    if (!pool.startLocation) {
      throw new Error('Pool must have a start location to optimize route')
    }

    const optimizedRoute = optimizeRoute(pool.startLocation, pool.orders)
    
    if (!optimizedRoute) {
      throw new Error('Could not optimize route')
    }

    // Recalculate costs
    const costs = calculateCosts(pool, optimizedRoute)

    return poolingService.updatePool(poolId, {
      optimizedRoute,
      estimatedDistance: optimizedRoute.totalDistance,
      estimatedTime: optimizedRoute.estimatedTime,
      cost: costs.pooledCost,
      savings: costs.savings,
      updatedAt: new Date()
    })
  }
}

export default poolingService

