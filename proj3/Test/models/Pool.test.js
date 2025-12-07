import { describe, it, expect } from 'vitest'
import { Pool, POOL_STATUS } from '../../src/models/Pool'

describe('Pool Model', () => {
  const mockOrder1 = {
    id: 'ORD-001',
    status: 'pending',
    total: 25.99,
    location: { lat: 40.7128, lng: -74.0060, address: '123 Main St' }
  }

  const mockOrder2 = {
    id: 'ORD-002',
    status: 'pending',
    total: 15.50,
    location: { lat: 40.7489, lng: -73.9857, address: '456 Park Ave' }
  }

  describe('Constructor', () => {
    it('should create a valid pool with minimum required fields', () => {
      const pool = new Pool({
        id: 'POOL-001',
        name: 'Test Pool',
        orders: [mockOrder1, mockOrder2],
        startLocation: { lat: 40.7128, lng: -74.0060 }
      })

      expect(pool.id).toBe('POOL-001')
      expect(pool.name).toBe('Test Pool')
      expect(pool.orders).toHaveLength(2)
      expect(pool.status).toBe('pending')
    })

    it('should set default values for optional fields', () => {
      const pool = new Pool({
        id: 'POOL-002',
        name: 'Default Pool',
        orders: [mockOrder1, mockOrder2]
      })

      expect(pool.description).toBe('')
      expect(pool.orders).toHaveLength(2)
      expect(pool.driverId).toBeNull()
      expect(pool.status).toBe('pending')
      expect(pool.cost).toBe(0)
      expect(pool.savings).toBe(0)
    })
  })

  describe('toJSON', () => {
    it('should serialize pool to JSON', () => {
      const pool = new Pool({
        id: 'POOL-003',
        name: 'JSON Pool',
        orders: [mockOrder1, mockOrder2],
        driverId: 'DRV-001',
        status: 'active',
        cost: 10.50,
        savings: 5.25
      })

      const json = pool.toJSON()

      expect(json.id).toBe('POOL-003')
      expect(json.name).toBe('JSON Pool')
      expect(json.orders).toHaveLength(2)
      expect(json.driverId).toBe('DRV-001')
      expect(json.status).toBe('active')
      expect(json.cost).toBe(10.50)
      expect(json.savings).toBe(5.25)
    })

    it('should handle dates in JSON serialization', () => {
      const now = new Date()
      const pool = new Pool({
        id: 'POOL-004',
        name: 'Date Pool',
        orders: [mockOrder1, mockOrder2],
        createdAt: now,
        updatedAt: now
      })

      const json = pool.toJSON()

      expect(json.createdAt).toBe(now.toISOString())
      expect(json.updatedAt).toBe(now.toISOString())
    })
  })

  describe('fromAPIResponse', () => {
    it('should create pool from API response', () => {
      const apiData = {
        id: 'POOL-005',
        name: 'API Pool',
        description: 'From API',
        orders: [mockOrder1, mockOrder2],
        driverId: 'DRV-002',
        status: 'active',
        startLocation: { lat: 40.7128, lng: -74.0060 },
        optimizedRoute: { waypoints: [] },
        estimatedDistance: 15.5,
        estimatedTime: 30,
        cost: 12.00,
        savings: 6.00,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T01:00:00Z',
        metadata: {}
      }

      const pool = Pool.fromAPIResponse(apiData)

      expect(pool.id).toBe('POOL-005')
      expect(pool.name).toBe('API Pool')
      expect(pool.description).toBe('From API')
      expect(pool.orders).toHaveLength(2)
      expect(pool.driverId).toBe('DRV-002')
      expect(pool.status).toBe('active')
      expect(pool.cost).toBe(12.00)
      expect(pool.savings).toBe(6.00)
      expect(pool.createdAt).instanceOf(Date)
      expect(pool.updatedAt).instanceOf(Date)
    })

    it('should handle missing optional fields', () => {
      const apiData = {
        id: 'POOL-006',
        name: 'Minimal Pool',
        orders: [mockOrder1, mockOrder2]
      }

      const pool = Pool.fromAPIResponse(apiData)

      expect(pool.description).toBe('')
      expect(pool.driverId).toBeNull()
      expect(pool.status).toBe('pending')
    })
  })

  describe('validate', () => {
    it('should validate a valid pool', () => {
      const pool = new Pool({
        id: 'POOL-007',
        name: 'Valid Pool',
        orders: [mockOrder1, mockOrder2]
      })

      const validation = pool.validate()

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should reject pool without ID', () => {
      const pool = new Pool({
        name: 'No ID Pool',
        orders: [mockOrder1, mockOrder2]
      })

      const validation = pool.validate()

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Pool ID is required')
    })

    it('should reject pool without name', () => {
      const pool = new Pool({
        id: 'POOL-008',
        orders: [mockOrder1, mockOrder2]
      })

      const validation = pool.validate()

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Pool name is required')
    })

    it('should reject pool with less than 2 orders', () => {
      const pool = new Pool({
        id: 'POOL-009',
        name: 'Single Order Pool',
        orders: [mockOrder1]
      })

      const validation = pool.validate()

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Pool must contain at least 2 orders')
    })

    it('should reject pool with more than 10 orders', () => {
      const manyOrders = Array.from({ length: 11 }, (_, i) => ({
        ...mockOrder1,
        id: `ORD-${i + 1}`
      }))

      const pool = new Pool({
        id: 'POOL-010',
        name: 'Too Many Orders Pool',
        orders: manyOrders
      })

      const validation = pool.validate()

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Pool cannot contain more than 10 orders')
    })

    it('should reject invalid status', () => {
      const pool = new Pool({
        id: 'POOL-011',
        name: 'Invalid Status Pool',
        orders: [mockOrder1, mockOrder2],
        status: 'invalid'
      })

      const validation = pool.validate()

      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    it('should reject negative distance', () => {
      const pool = new Pool({
        id: 'POOL-012',
        name: 'Negative Distance Pool',
        orders: [mockOrder1, mockOrder2],
        estimatedDistance: -5
      })

      const validation = pool.validate()

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Estimated distance cannot be negative')
    })

    it('should reject negative time', () => {
      const pool = new Pool({
        id: 'POOL-013',
        name: 'Negative Time Pool',
        orders: [mockOrder1, mockOrder2],
        estimatedTime: -10
      })

      const validation = pool.validate()

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Estimated time cannot be negative')
    })
  })

  describe('getStatistics', () => {
    it('should calculate pool statistics', () => {
      const pool = new Pool({
        id: 'POOL-014',
        name: 'Stats Pool',
        orders: [mockOrder1, mockOrder2],
        estimatedDistance: 20,
        cost: 15.00,
        savings: 5.00
      })

      const stats = pool.getStatistics()

      expect(stats.totalOrders).toBe(2)
      expect(stats.totalValue).toBe(41.49)
      expect(stats.averageDistance).toBe(10)
      expect(stats.costPerOrder).toBe(7.50)
      expect(stats.savingsPercentage).toBeGreaterThan(0)
    })

    it('should handle empty pool gracefully', () => {
      const pool = new Pool({
        id: 'POOL-015',
        name: 'Empty Pool',
        orders: []
      })

      const stats = pool.getStatistics()

      expect(stats.totalOrders).toBe(0)
      expect(stats.averageDistance).toBe(0)
      expect(stats.costPerOrder).toBe(0)
    })
  })

  describe('canAddOrder', () => {
    it('should allow adding order to pending pool', () => {
      const pool = new Pool({
        id: 'POOL-016',
        name: 'Addable Pool',
        orders: [mockOrder1],
        status: 'pending'
      })

      const result = pool.canAddOrder(mockOrder2)

      expect(result.canAdd).toBe(true)
    })

    it('should reject adding order to full pool', () => {
      const manyOrders = Array.from({ length: 10 }, (_, i) => ({
        ...mockOrder1,
        id: `ORD-${i + 1}`
      }))

      const pool = new Pool({
        id: 'POOL-017',
        name: 'Full Pool',
        orders: manyOrders,
        status: 'pending'
      })

      const result = pool.canAddOrder(mockOrder2)

      expect(result.canAdd).toBe(false)
      expect(result.reason).toContain('Pool is full')
    })

    it('should reject adding order to completed pool', () => {
      const pool = new Pool({
        id: 'POOL-018',
        name: 'Completed Pool',
        orders: [mockOrder1, mockOrder2],
        status: 'completed'
      })

      const result = pool.canAddOrder({
        id: 'ORD-003',
        status: 'pending'
      })

      expect(result.canAdd).toBe(false)
      expect(result.reason).toContain('Cannot add orders')
    })

    it('should reject adding duplicate order', () => {
      const pool = new Pool({
        id: 'POOL-019',
        name: 'Duplicate Pool',
        orders: [mockOrder1],
        status: 'pending'
      })

      const result = pool.canAddOrder(mockOrder1)

      expect(result.canAdd).toBe(false)
      expect(result.reason).toContain('already in pool')
    })

    it('should reject adding order with incompatible status', () => {
      const pool = new Pool({
        id: 'POOL-020',
        name: 'Status Pool',
        orders: [mockOrder1],
        status: 'pending'
      })

      const deliveredOrder = {
        id: 'ORD-003',
        status: 'delivered'
      }

      const result = pool.canAddOrder(deliveredOrder)

      expect(result.canAdd).toBe(false)
      expect(result.reason).toContain('not compatible')
    })
  })

  describe('removeOrder', () => {
    it('should remove order from pool', () => {
      const pool = new Pool({
        id: 'POOL-021',
        name: 'Remove Pool',
        orders: [mockOrder1, mockOrder2],
        status: 'pending'
      })

      pool.removeOrder(mockOrder1.id)

      expect(pool.orders).toHaveLength(1)
      expect(pool.orders[0].id).toBe(mockOrder2.id)
    })

    it('should update timestamp when removing order', () => {
      const originalTime = new Date('2024-01-01T00:00:00Z')
      const pool = new Pool({
        id: 'POOL-022',
        name: 'Timestamp Pool',
        orders: [mockOrder1, mockOrder2],
        updatedAt: originalTime
      })

      pool.removeOrder(mockOrder1.id)

      expect(pool.updatedAt).not.toEqual(originalTime)
    })

    it('should throw error when removing non-existent order', () => {
      const pool = new Pool({
        id: 'POOL-023',
        name: 'Error Pool',
        orders: [mockOrder1, mockOrder2]
      })

      expect(() => pool.removeOrder('ORD-NONEXISTENT')).toThrow('Order not found')
    })
  })

  describe('canStart', () => {
    it('should allow starting pool with enough orders and driver', () => {
      const pool = new Pool({
        id: 'POOL-024',
        name: 'Startable Pool',
        orders: [mockOrder1, mockOrder2],
        status: 'pending',
        driverId: 'DRV-001'
      })

      const result = pool.canStart()

      expect(result.canStart).toBe(true)
    })

    it('should reject starting pool with too few orders', () => {
      const pool = new Pool({
        id: 'POOL-025',
        name: 'Small Pool',
        orders: [mockOrder1],
        status: 'pending',
        driverId: 'DRV-001'
      })

      const result = pool.canStart()

      expect(result.canStart).toBe(false)
      expect(result.reason).toContain('at least 2 orders')
    })

    it('should reject starting pool without driver', () => {
      const pool = new Pool({
        id: 'POOL-026',
        name: 'No Driver Pool',
        orders: [mockOrder1, mockOrder2],
        status: 'pending'
      })

      const result = pool.canStart()

      expect(result.canStart).toBe(false)
      expect(result.reason).toContain('Driver must be assigned')
    })

    it('should reject starting pool in wrong status', () => {
      const pool = new Pool({
        id: 'POOL-027',
        name: 'Completed Pool',
        orders: [mockOrder1, mockOrder2],
        status: 'completed',
        driverId: 'DRV-001'
      })

      const result = pool.canStart()

      expect(result.canStart).toBe(false)
    })
  })

  describe('POOL_STATUS constants', () => {
    it('should have all required status constants', () => {
      expect(POOL_STATUS.PENDING).toBe('pending')
      expect(POOL_STATUS.ACTIVE).toBe('active')
      expect(POOL_STATUS.IN_PROGRESS).toBe('in-progress')
      expect(POOL_STATUS.COMPLETED).toBe('completed')
      expect(POOL_STATUS.CANCELLED).toBe('cancelled')
    })
  })
})

