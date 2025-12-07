// Batch Model - Represents a cluster of orders assigned to a driver
import { Order } from './Order'

export class Batch {
  constructor({
    id,
    driverId,
    driverName,
    orders = [],
    status = 'pending', // 'pending', 'assigned', 'in-progress', 'completed'
    assignedAt = null,
    estimatedDeliveryTime = null,
    totalDistance = 0,
    route = [],
    metadata = {}
  }) {
    this.id = id
    this.driverId = driverId
    this.driverName = driverName
    this.orders = orders.map(order => order instanceof Order ? order : new Order(order))
    this.status = status
    this.assignedAt = assignedAt ? new Date(assignedAt) : new Date()
    this.estimatedDeliveryTime = estimatedDeliveryTime
    this.totalDistance = totalDistance
    this.route = route // Array of { lat, lng, orderId } for route optimization
    this.metadata = metadata
  }

  toJSON() {
    return {
      id: this.id,
      driverId: this.driverId,
      driverName: this.driverName,
      orders: this.orders.map(o => o instanceof Order ? o.toJSON() : o),
      status: this.status,
      assignedAt: this.assignedAt.toISOString(),
      estimatedDeliveryTime: this.estimatedDeliveryTime,
      totalDistance: this.totalDistance,
      route: this.route,
      metadata: this.metadata
    }
  }

  static fromAPIResponse(data) {
    return new Batch({
      id: data.id,
      driverId: data.driverId,
      driverName: data.driverName,
      orders: data.orders || [],
      status: data.status || 'pending',
      assignedAt: data.assignedAt,
      estimatedDeliveryTime: data.estimatedDeliveryTime,
      totalDistance: data.totalDistance || 0,
      route: data.route || [],
      metadata: data.metadata || {}
    })
  }

  validate() {
    const errors = []
    if (!this.driverId) errors.push('Driver ID is required')
    if (!Array.isArray(this.orders)) errors.push('Orders must be an array')
    if (this.orders.length === 0) errors.push('Batch must contain at least one order')
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Get all order IDs in this batch
  getOrderIds() {
    return this.orders.map(order => order.id)
  }

  // Get total value of all orders in batch
  getTotalValue() {
    return this.orders.reduce((sum, order) => sum + (order.total || 0), 0)
  }

  // Get count of orders
  getOrderCount() {
    return this.orders.length
  }

  // Check if batch is complete (all orders delivered)
  isComplete() {
    return this.orders.every(order => order.status === 'delivered')
  }

  // Update batch status based on order statuses
  updateStatus() {
    if (this.isComplete()) {
      this.status = 'completed'
    } else if (this.orders.some(o => o.status === 'picked-up')) {
      this.status = 'in-progress'
    } else if (this.driverId) {
      this.status = 'assigned'
    }
  }
}

export default Batch

