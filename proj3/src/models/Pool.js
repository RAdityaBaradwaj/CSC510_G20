// Pool Model for Order Pooling
export class Pool {
  constructor({
    id,
    name,
    description = '',
    orders = [],
    driverId = null,
    driverName = null,
    status = 'pending',
    startLocation = null,
    optimizedRoute = null,
    estimatedDistance = 0,
    estimatedTime = 0,
    cost = 0,
    savings = 0,
    createdAt = new Date(),
    updatedAt = new Date(),
    metadata = {}
  }) {
    this.id = id
    this.name = name
    this.description = description
    this.orders = orders // Array of Order objects
    this.driverId = driverId
    this.driverName = driverName
    this.status = status
    this.startLocation = startLocation // { lat, lng, address }
    this.optimizedRoute = optimizedRoute
    this.estimatedDistance = estimatedDistance // km
    this.estimatedTime = estimatedTime // minutes
    this.cost = cost
    this.savings = savings
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.metadata = metadata
  }

  // Serialize to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      orders: this.orders.map(order => {
        // If orders are Order model instances, serialize them
        if (order && typeof order.toJSON === 'function') {
          return order.toJSON()
        }
        return order
      }),
      driverId: this.driverId,
      driverName: this.driverName,
      status: this.status,
      startLocation: this.startLocation,
      optimizedRoute: this.optimizedRoute,
      estimatedDistance: this.estimatedDistance,
      estimatedTime: this.estimatedTime,
      cost: this.cost,
      savings: this.savings,
      createdAt: this.createdAt instanceof Date ? this.createdAt.toISOString() : this.createdAt,
      updatedAt: this.updatedAt instanceof Date ? this.updatedAt.toISOString() : this.updatedAt,
      metadata: this.metadata
    }
  }

  // Create Pool from API response
  static fromAPIResponse(data) {
    return new Pool({
      id: data.id,
      name: data.name,
      description: data.description || '',
      orders: data.orders || [],
      driverId: data.driverId || null,
      driverName: data.driverName || null,
      status: data.status || 'pending',
      startLocation: data.startLocation || null,
      optimizedRoute: data.optimizedRoute || null,
      estimatedDistance: data.estimatedDistance || 0,
      estimatedTime: data.estimatedTime || 0,
      cost: data.cost || 0,
      savings: data.savings || 0,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      metadata: data.metadata || {}
    })
  }

  // Validate pool data
  validate() {
    const errors = []

    if (!this.id) {
      errors.push('Pool ID is required')
    }

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Pool name is required')
    }

    if (!this.orders || this.orders.length < 2) {
      errors.push('Pool must contain at least 2 orders')
    }

    if (this.orders && this.orders.length > 10) {
      errors.push('Pool cannot contain more than 10 orders')
    }

    const validStatuses = ['pending', 'active', 'in-progress', 'completed', 'cancelled']
    if (!validStatuses.includes(this.status)) {
      errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }

    if (this.estimatedDistance < 0) {
      errors.push('Estimated distance cannot be negative')
    }

    if (this.estimatedTime < 0) {
      errors.push('Estimated time cannot be negative')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Get pool statistics
  getStatistics() {
    return {
      totalOrders: this.orders.length,
      totalValue: this.orders.reduce((sum, order) => sum + (order.total || 0), 0),
      averageDistance: this.estimatedDistance / Math.max(1, this.orders.length),
      costPerOrder: this.cost / Math.max(1, this.orders.length),
      savingsPercentage: this.savings > 0 ? (this.savings / (this.cost + this.savings)) * 100 : 0,
      estimatedEfficiency: this.estimatedDistance / Math.max(1, this.orders.length)
    }
  }

  // Check if order can be added to pool
  canAddOrder(order) {
    // Check if pool is full
    if (this.orders.length >= 10) {
      return { canAdd: false, reason: 'Pool is full (max 10 orders)' }
    }

    // Check if pool status allows adding orders
    if (!['pending', 'active'].includes(this.status)) {
      return { canAdd: false, reason: 'Cannot add orders to pool in current status' }
    }

    // Check if order is already in pool
    if (this.orders.some(o => o.id === order.id)) {
      return { canAdd: false, reason: 'Order is already in pool' }
    }

    // Check if order status is compatible
    const compatibleStatuses = ['pending', 'processing']
    if (!compatibleStatuses.includes(order.status)) {
      return { canAdd: false, reason: 'Order status not compatible for pooling' }
    }

    return { canAdd: true, reason: null }
  }

  // Remove order from pool
  removeOrder(orderId) {
    const index = this.orders.findIndex(o => o.id === orderId)
    if (index === -1) {
      throw new Error('Order not found in pool')
    }

    this.orders.splice(index, 1)
    this.updatedAt = new Date()
    return this
  }

  // Check if pool can be started
  canStart() {
    if (this.orders.length < 2) {
      return { canStart: false, reason: 'Pool must contain at least 2 orders' }
    }

    if (this.status !== 'pending' && this.status !== 'active') {
      return { canStart: false, reason: 'Pool cannot be started in current status' }
    }

    if (!this.driverId) {
      return { canStart: false, reason: 'Driver must be assigned before starting' }
    }

    return { canStart: true, reason: null }
  }
}

// Pool status constants
export const POOL_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// Default export
export default Pool

