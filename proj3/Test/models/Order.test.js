import { describe, test, expect } from 'vitest'
import { Order, OrderItem } from '../../src/models/Order'

describe('Order Model', () => {
  describe('Order Construction', () => {
    test('should create order with required fields', () => {
      const order = new Order({
        id: 'ORD-001',
        customerId: 'CUST-001',
        customerName: 'John Doe',
        businessId: 'BIZ-001',
        businessName: 'Test Business',
        location: { lat: 40.7128, lng: -74.0060 },
        items: []
      })

      expect(order).toBeInstanceOf(Order)
      expect(order.id).toBe('ORD-001')
      expect(order.customerId).toBe('CUST-001')
      expect(order.status).toBe('pending')
    })

    test('should set default values', () => {
      const order = new Order({
        id: 'ORD-001',
        customerId: 'CUST-001',
        businessId: 'BIZ-001',
        location: { lat: 40.7128, lng: -74.0060 },
        items: []
      })

      expect(order.status).toBe('pending')
      expect(order.driverId).toBeNull()
      expect(order.items).toEqual([])
      expect(order.total).toBe(0)
      expect(order.metadata).toEqual({})
    })
  })

  describe('toJSON', () => {
    test('should serialize order to JSON', () => {
      const order = new Order({
        id: 'ORD-001',
        customerId: 'CUST-001',
        businessId: 'BIZ-001',
        location: { lat: 40.7128, lng: -74.0060 },
        items: [],
        total: 10.00
      })

      const json = order.toJSON()
      
      expect(json).toBeDefined()
      expect(json.id).toBe('ORD-001')
      expect(json.total).toBe(10.00)
      expect(typeof json.createdAt).toBe('object')
    })
  })

  describe('fromAPIResponse', () => {
    test('should create order from API response', () => {
      const apiResponse = {
        id: 'ORD-001',
        customerId: 'CUST-001',
        customerName: 'John Doe',
        businessId: 'BIZ-001',
        businessName: 'Test Business',
        status: 'processing',
        location: { lat: 40.7128, lng: -74.0060 },
        items: [],
        total: 25.00,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const order = Order.fromAPIResponse(apiResponse)
      
      expect(order).toBeInstanceOf(Order)
      expect(order.id).toBe('ORD-001')
      expect(order.status).toBe('processing')
      expect(order.total).toBe(25.00)
    })

    test('should handle nested customer/business objects', () => {
      const apiResponse = {
        id: 'ORD-001',
        customer: { id: 'CUST-001', name: 'John Doe' },
        business: { id: 'BIZ-001', name: 'Test Business' },
        location: { lat: 40.7128, lng: -74.0060 },
        items: []
      }

      const order = Order.fromAPIResponse(apiResponse)
      
      expect(order.customerName).toBe('John Doe')
      expect(order.businessName).toBe('Test Business')
    })
  })

  describe('validate', () => {
    test('should validate correct order', () => {
      const order = new Order({
        id: 'ORD-001',
        customerId: 'CUST-001',
        businessId: 'BIZ-001',
        location: { lat: 40.7128, lng: -74.0060 },
        items: [{ productName: 'Test', quantity: 1, price: 10 }]
      })

      const result = order.validate()
      
      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    test('should fail validation for missing customer ID', () => {
      const order = new Order({
        id: 'ORD-001',
        businessId: 'BIZ-001',
        location: { lat: 40.7128, lng: -74.0060 },
        items: []
      })

      const result = order.validate()
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Customer ID is required')
    })

    test('should fail validation for missing items', () => {
      const order = new Order({
        id: 'ORD-001',
        customerId: 'CUST-001',
        businessId: 'BIZ-001',
        location: { lat: 40.7128, lng: -74.0060 },
        items: []
      })

      const result = order.validate()
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Order must have at least one item')
    })
  })

  describe('canUpdateStatus', () => {
    test('should return allowed statuses for pending', () => {
      const order = new Order({
        id: 'ORD-001',
        customerId: 'CUST-001',
        businessId: 'BIZ-001',
        location: { lat: 40.7128, lng: -74.0060 },
        status: 'pending',
        items: []
      })

      const allowed = order.canUpdateStatus()
      
      expect(allowed).toContain('processing')
      expect(allowed).toContain('cancelled')
    })

    test('should return allowed statuses for processing', () => {
      const order = new Order({
        id: 'ORD-001',
        customerId: 'CUST-001',
        businessId: 'BIZ-001',
        location: { lat: 40.7128, lng: -74.0060 },
        status: 'processing',
        items: []
      })

      const allowed = order.canUpdateStatus()
      
      expect(allowed).toContain('ready')
      expect(allowed).toContain('cancelled')
    })
  })

  describe('isCancellable', () => {
    test('should return true for cancellable orders', () => {
      const pendingOrder = new Order({
        id: 'ORD-001',
        customerId: 'CUST-001',
        businessId: 'BIZ-001',
        location: { lat: 40.7128, lng: -74.0060 },
        status: 'pending',
        items: []
      })

      expect(pendingOrder.isCancellable()).toBe(true)
    })

    test('should return false for delivered orders', () => {
      const deliveredOrder = new Order({
        id: 'ORD-001',
        customerId: 'CUST-001',
        businessId: 'BIZ-001',
        location: { lat: 40.7128, lng: -74.0060 },
        status: 'delivered',
        items: []
      })

      expect(deliveredOrder.isCancellable()).toBe(false)
    })
  })
})

describe('OrderItem Model', () => {
  test('should create order item', () => {
    const item = new OrderItem({
      id: '1',
      productId: 'PROD-001',
      productName: 'Test Product',
      quantity: 2,
      price: 10.00
    })

    expect(item.subtotal).toBe(20.00)
    expect(item.productName).toBe('Test Product')
  })

  test('should calculate subtotal if not provided', () => {
    const item = new OrderItem({
      id: '1',
      productName: 'Test Product',
      quantity: 3,
      price: 5.00
    })

    expect(item.subtotal).toBe(15.00)
  })
})

