import { describe, test, expect, beforeEach, vi } from 'vitest'
import { Order } from '../../src/models/Order'
import { orderService } from '../../src/services/orders/orderService'

// Mock data
const mockOrders = [
  {
    id: 'ORD-001',
    customerId: 'CUST-001',
    customerName: 'John Doe',
    businessId: 'BIZ-001',
    businessName: 'Test Business',
    status: 'pending',
    location: { lat: 40.7128, lng: -74.0060, zipCode: '10001' },
    items: [{ productName: 'Test Product', quantity: 1, price: 10.00 }],
    total: 10.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {}
  }
]

describe('Order Service', () => {
  beforeEach(() => {
    // Reset mock data before each test
    vi.clearAllMocks()
  })

  describe('getAllOrders', () => {
    test('should return all orders', async () => {
      const orders = await orderService.getAllOrders()
      expect(orders).toBeDefined()
      expect(Array.isArray(orders)).toBe(true)
      expect(orders.length).toBeGreaterThan(0)
    })

    test('should filter orders by status', async () => {
      const orders = await orderService.getAllOrders({ status: 'pending' })
      expect(orders).toBeDefined()
      orders.forEach(order => {
        expect(order.status).toBe('pending')
      })
    })

    test('should filter orders by customer ID', async () => {
      const orders = await orderService.getAllOrders({ customerId: 'CUST-001' })
      expect(orders).toBeDefined()
      orders.forEach(order => {
        expect(order.customerId).toBe('CUST-001')
      })
    })
  })

  describe('getOrderById', () => {
    test('should return order by ID', async () => {
      const order = await orderService.getOrderById('ORD-001')
      expect(order).toBeDefined()
      expect(order.id).toBe('ORD-001')
      expect(order).toBeInstanceOf(Order)
    })

    test('should throw error for non-existent order', async () => {
      await expect(orderService.getOrderById('INVALID-ID')).rejects.toThrow('Order not found')
    })
  })

  describe('getNearbyOrders', () => {
    test('should return orders within radius', async () => {
      const location = { lat: 40.7128, lng: -74.0060 }
      const orders = await orderService.getNearbyOrders(location, 10)
      
      expect(orders).toBeDefined()
      expect(Array.isArray(orders)).toBe(true)
      orders.forEach(order => {
        expect(order.distance).toBeLessThanOrEqual(10)
      })
    })

    test('should throw error if location not provided', async () => {
      await expect(orderService.getNearbyOrders(null, 10)).rejects.toThrow('Location is required')
    })

    test('should filter by status in nearby orders', async () => {
      const location = { lat: 40.7128, lng: -74.0060 }
      const orders = await orderService.getNearbyOrders(location, 10, { status: 'ready' })
      
      expect(orders).toBeDefined()
      orders.forEach(order => {
        expect(order.status).toBe('ready')
        expect(order.distance).toBeLessThanOrEqual(10)
      })
    })

    test('should sort orders by distance', async () => {
      const location = { lat: 40.7128, lng: -74.0060 }
      const orders = await orderService.getNearbyOrders(location, 50)
      
      for (let i = 1; i < orders.length; i++) {
        expect(orders[i].distance).toBeGreaterThanOrEqual(orders[i - 1].distance)
      }
    })
  })

  describe('createOrder', () => {
    test('should create a new order', async () => {
      const orderData = {
        customerId: 'CUST-002',
        customerName: 'Jane Doe',
        businessId: 'BIZ-001',
        businessName: 'Test Business',
        location: { lat: 40.7128, lng: -74.0060, zipCode: '10001', address: 'Test Address' },
        items: [{ productName: 'Test Product', quantity: 1, price: 15.00 }],
        total: 15.00
      }

      const newOrder = await orderService.createOrder(orderData)
      
      expect(newOrder).toBeDefined()
      expect(newOrder).toBeInstanceOf(Order)
      expect(newOrder.customerId).toBe('CUST-002')
      expect(newOrder.total).toBe(15.00)
    })

    test('should throw error if required fields missing', async () => {
      const invalidOrder = {
        customerId: 'CUST-002',
        // Missing location and items
      }

      await expect(orderService.createOrder(invalidOrder)).rejects.toThrow()
    })
  })

  describe('updateOrder', () => {
    test('should update existing order', async () => {
      const updates = { status: 'processing' }
      const updatedOrder = await orderService.updateOrder('ORD-001', updates)
      
      expect(updatedOrder).toBeDefined()
      expect(updatedOrder.status).toBe('processing')
    })

    test('should throw error for non-existent order', async () => {
      await expect(orderService.updateOrder('INVALID-ID', {})).rejects.toThrow()
    })
  })

  describe('updateOrderStatus', () => {
    test('should update order status', async () => {
      const updatedOrder = await orderService.updateOrderStatus('ORD-001', 'ready')
      
      expect(updatedOrder).toBeDefined()
      expect(updatedOrder.status).toBe('ready')
    })
  })

  describe('assignDriver', () => {
    test('should assign driver to order', async () => {
      const updatedOrder = await orderService.assignDriver('ORD-001', 'DRV-001')
      
      expect(updatedOrder).toBeDefined()
      expect(updatedOrder.driverId).toBe('DRV-001')
    })
  })

  describe('cancelOrder', () => {
    test('should cancel cancellable order', async () => {
      const cancelledOrder = await orderService.cancelOrder('ORD-001')
      
      expect(cancelledOrder).toBeDefined()
      expect(cancelledOrder.status).toBe('cancelled')
    })

    test('should throw error if order cannot be cancelled', async () => {
      // First set order to delivered (non-cancellable)
      await orderService.updateOrderStatus('ORD-001', 'delivered')
      
      await expect(orderService.cancelOrder('ORD-001')).rejects.toThrow()
    })
  })

  describe('deleteOrder', () => {
    test('should delete order', async () => {
      const result = await orderService.deleteOrder('ORD-001')
      
      expect(result).toBeDefined()
      expect(result.deleted).toBe(true)
    })
  })
})

