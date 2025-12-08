// Batch Service - Handles order batching and driver assignment

import { Batch } from '../../models/Batch'
import { clusterOrders, optimizeRoute } from '../clustering/orderClustering'
import { driverService } from '../drivers/driverService'
import { orderService } from '../orders/orderService'
import { loadBatches, saveBatches } from './storage'
import { distanceCalculator } from '../../utils/distanceCalculator'

// In-memory batch storage
const batches = loadBatches()

const useMockAPI = () => {
  return import.meta.env.VITE_USE_MOCK_DATA !== 'false' || !import.meta.env.VITE_API_BASE_URL
}

export const batchService = {
  // Get all batches
  getAllBatches: async (filters = {}) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 300))
      let result = [...batches]
      
      if (filters.driverId) {
        result = result.filter(b => b.driverId === filters.driverId)
      }
      if (filters.status) {
        result = result.filter(b => b.status === filters.status)
      }
      
      return result.map(b => Batch.fromAPIResponse(b))
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.get(endpoints.batches?.list() || '/api/batches', { params: filters })
      return response.map(b => Batch.fromAPIResponse(b))
    }
  },

  // Get batch by ID
  getBatchById: async (id) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const batch = batches.find(b => b.id === id)
      if (!batch) throw new Error('Batch not found')
      return Batch.fromAPIResponse(batch)
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.get(endpoints.batches?.byId(id) || `/api/batches/${id}`)
      return Batch.fromAPIResponse(response)
    }
  },

  // Automatically cluster and assign orders to drivers
  assignOrdersToDrivers: async (options = {}) => {
    const {
      maxOrdersPerBatch = 10,
      maxDistanceKm = 20
    } = options

    // Get all pending/ready orders
    const orders = await orderService.getAllOrders({ 
      status: 'pending' // or 'ready' depending on your workflow
    })

    // Filter out orders that already have a driver
    const unassignedOrders = orders.filter(o => !o.driverId)
      .filter(o => {
        const pickup = o.pickupLocation || o.businessLocation
        const drop = o.location || o.deliveryLocation
        return pickup?.lat && pickup?.lng && drop?.lat && drop?.lng
      })

    if (unassignedOrders.length === 0) {
      return []
    }

    // Get all available drivers
    const drivers = await driverService.getAllDrivers({ status: 'available' })

    if (drivers.length === 0) {
      throw new Error('No available drivers found')
    }

    // Cluster orders
    const clusters = await clusterOrders(unassignedOrders, drivers, maxOrdersPerBatch, maxDistanceKm)

    // Create batches from clusters
    const createdBatches = []
    
    for (const cluster of clusters) {
      if (cluster.orders.length === 0) continue

      // Get driver details
      const driver = await driverService.getDriverById(cluster.driverId)
      
      // Optimize route starting at first pickup (business/store)
      const startLoc = cluster.orders[0]?.pickupLocation || cluster.orders[0]?.businessLocation || cluster.orders[0]?.storeLocation || cluster.orders[0]?.location || driver.currentLocation
      const route = optimizeRoute(cluster.orders, driver.currentLocation, startLoc)

      // Calculate total route distance based on optimized path
      const totalDistance = computeRouteDistanceKm(route)

      // Create batch
      const batch = new Batch({
        id: `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        driverId: cluster.driverId,
        driverName: cluster.driverName,
        orders: cluster.orders,
        status: 'assigned',
        totalDistance,
        route: route,
        assignedAt: new Date(),
        metadata: {
          origin: startLoc
        }
      })

      // Update orders with driver assignment
      for (const order of cluster.orders) {
        await orderService.assignDriver(order.id, cluster.driverId)
      }

      // Save batch
      if (useMockAPI()) {
        batches.push(batch.toJSON())
        saveBatches(batches)
      } else {
        const { endpoints } = await import('../api/endpoints')
        const { api } = await import('../api/client')
        await api.post(endpoints.batches?.list() || '/api/batches', batch.toJSON())
      }

      createdBatches.push(batch)
    }

    return createdBatches
  },

  // Create batch manually
  createBatch: async (batchData) => {
    const newBatch = new Batch({
      ...batchData,
      id: batchData.id || `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      assignedAt: batchData.assignedAt || new Date()
    })

    const validation = newBatch.validate()
    if (!validation.isValid) {
      throw new Error(`Batch validation failed: ${validation.errors.join(', ')}`)
    }

    // Assign driver to all orders in batch
    for (const order of newBatch.orders) {
      await orderService.assignDriver(order.id, newBatch.driverId)
    }

    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 500))
      batches.push(newBatch.toJSON())
      return newBatch
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.post(endpoints.batches?.list() || '/api/batches', newBatch.toJSON())
      return Batch.fromAPIResponse(response)
    }
  },

  // Update batch
  updateBatch: async (id, updates) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const batchIndex = batches.findIndex(b => b.id === id)
      if (batchIndex === -1) throw new Error('Batch not found')
      
      batches[batchIndex] = {
        ...batches[batchIndex],
        ...updates
      }
      
      // Update status based on orders
      const batch = Batch.fromAPIResponse(batches[batchIndex])
      batch.updateStatus()
      batches[batchIndex] = batch.toJSON()
      saveBatches(batches)
      
      return batch
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.put(endpoints.batches?.byId(id) || `/api/batches/${id}`, updates)
      return Batch.fromAPIResponse(response)
    }
  },

  // Get batches for a specific driver
  getDriverBatches: async (driverId) => {
    return batchService.getAllBatches({ driverId })
  }
}

function computeRouteDistanceKm(route = []) {
  if (!route || route.length < 2) return 0
  let total = 0
  for (let i = 1; i < route.length; i++) {
    const prev = route[i - 1]
    const curr = route[i]
    if (prev?.lat && prev?.lng && curr?.lat && curr?.lng) {
      total += distanceCalculator.calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng)
    }
  }
  return total
}

export default batchService
