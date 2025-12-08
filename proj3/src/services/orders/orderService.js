// Order Service - Handles all order-related operations
// Uses local storage to persist real customer orders (no static mocks)

import { Order } from '../../models/Order'
import { distanceCalculator } from '../../utils/distanceCalculator'

const STORAGE_KEY = 'neighborhoodpool-orders'

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

export const orderService = {
  // Get all orders
  getAllOrders: async (filters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 50))
    let orders = loadOrders().map(o => Order.fromAPIResponse(o))

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
  },

  // Get order by ID
  getOrderById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 50))
    const order = loadOrders().find(o => o.id === id)
    if (!order) throw new Error('Order not found')
    return Order.fromAPIResponse(order)
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
    const pickupLocation = orderData.pickupLocation || orderData.businessLocation || orderData.storeLocation
    const newOrder = new Order({
      ...orderData,
      pickupLocation,
      businessLocation: orderData.businessLocation || pickupLocation,
      id: `ORD-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const validation = newOrder.validate()
    if (!validation.isValid) {
      throw new Error(`Order validation failed: ${validation.errors.join(', ')}`)
    }

    await new Promise(resolve => setTimeout(resolve, 100))
    const orders = loadOrders()
    orders.push(newOrder.toJSON())
    saveOrders(orders)
    return newOrder
  },

  // Update order
  updateOrder: async (id, updates) => {
    await new Promise(resolve => setTimeout(resolve, 50))
    const orders = loadOrders()
    const orderIndex = orders.findIndex(o => o.id === id)
    if (orderIndex === -1) throw new Error('Order not found')

    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveOrders(orders)
    return Order.fromAPIResponse(orders[orderIndex])
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
    await new Promise(resolve => setTimeout(resolve, 50))
    const orders = loadOrders()
    const index = orders.findIndex(o => o.id === id)
    if (index === -1) throw new Error('Order not found')
    orders.splice(index, 1)
    saveOrders(orders)
    return { id, deleted: true }
  }
}

export default orderService
