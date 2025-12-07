// Order Service - Handles all order-related operations
// Abstracted to work with mock or real API

import { Order, OrderItem } from '../../models/Order'
import { distanceCalculator } from '../../utils/distanceCalculator'
import * as mockData from './mockData'

// API abstraction - switch between mock and real
const isMockMode = () => {
  return import.meta.env.VITE_USE_MOCK_DATA !== 'false' || !import.meta.env.VITE_API_BASE_URL
}

const useMockAPI = () => {
  // Use in-memory data for now
  return true // Always use mock for now
}

export const orderService = {
  // Get all orders
  getAllOrders: async (filters = {}) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 300))
      let orders = mockData.orders.map(order => Order.fromAPIResponse(order))
      
      // Apply filters
      if (filters.status) {
        orders = orders.filter(o => o.status === filters.status)
      }
      if (filters.customerId) {
        orders = orders.filter(o => o.customerId === filters.customerId)
      }
      if (filters.businessId) {
        orders = orders.filter(o => o.businessId === filters.businessId)
      }
      
      return orders
    } else {
      // Real API call would go here
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.get(endpoints.orders.list(), { params: filters })
      return response.map(order => Order.fromAPIResponse(order))
    }
  },

  // Get order by ID
  getOrderById: async (id) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const order = mockData.orders.find(o => o.id === id)
      if (!order) throw new Error('Order not found')
      return Order.fromAPIResponse(order)
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.get(endpoints.orders.byId(id))
      return Order.fromAPIResponse(response)
    }
  },

  // Get nearby orders based on location and radius
  getNearbyOrders: async (location, radius = 10, filters = {}) => {
    if (!location) {
      throw new Error('Location is required')
    }

    const orders = await orderService.getAllOrders(filters)
    
    // Calculate distances and filter by radius
    const ordersWithDistance = orders.map(order => {
      // Handle both location and deliveryLocation property names
      const orderLocation = order.deliveryLocation || order.location
      
      if (!orderLocation || !orderLocation.lat || !orderLocation.lng) {
        return {
          ...order,
          distance: Infinity // Will be filtered out
        }
      }
      
      const distance = distanceCalculator.calculateDistance(
        location.lat,
        location.lng,
        orderLocation.lat,
        orderLocation.lng
      )
      return {
        ...order,
        distance
      }
    })

    // Filter by radius and sort by distance, skip invalid orders
    return ordersWithDistance
      .filter(order => order.distance <= radius && order.distance !== Infinity)
      .sort((a, b) => a.distance - b.distance)
  },

  // Create new order
  createOrder: async (orderData) => {
    const newOrder = new Order({
      ...orderData,
      id: `ORD-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const validation = newOrder.validate()
    if (!validation.isValid) {
      throw new Error(`Order validation failed: ${validation.errors.join(', ')}`)
    }

    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 500))
      mockData.orders.push(newOrder.toJSON())
      return newOrder
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.post(endpoints.orders.list(), newOrder.toJSON())
      return Order.fromAPIResponse(response)
    }
  },

  // Update order
  updateOrder: async (id, updates) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const orderIndex = mockData.orders.findIndex(o => o.id === id)
      if (orderIndex === -1) throw new Error('Order not found')
      
      mockData.orders[orderIndex] = {
        ...mockData.orders[orderIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      return Order.fromAPIResponse(mockData.orders[orderIndex])
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.put(endpoints.orders.byId(id), updates)
      return Order.fromAPIResponse(response)
    }
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    return orderService.updateOrder(id, { status })
  },

  // Assign driver to order
  assignDriver: async (orderId, driverId) => {
    return orderService.updateOrder(orderId, { driverId })
  },

  // Cancel order
  cancelOrder: async (id) => {
    const order = await orderService.getOrderById(id)
    
    if (!order.isCancellable()) {
      throw new Error('Order cannot be cancelled at this stage')
    }
    
    return orderService.updateOrderStatus(id, 'cancelled')
  },

  // Delete order
  deleteOrder: async (id) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const index = mockData.orders.findIndex(o => o.id === id)
      if (index === -1) throw new Error('Order not found')
      mockData.orders.splice(index, 1)
      return { id, deleted: true }
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      return api.delete(endpoints.orders.byId(id))
    }
  }
}

export default orderService
