export { Order, OrderItem } from './Order'
export { User } from './User'
export { Driver } from './Driver'
export { Batch } from './Batch'
export { Pool, POOL_STATUS } from './Pool'

// Status enums
export const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  PICKED_UP: 'picked-up',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

export const UserType = {
  CUSTOMER: 'customer',
  DRIVER: 'driver',
  BUSINESS: 'business'
}

// Validation schemas
export const schemas = {
  order: {
    required: ['customerId', 'businessId', 'location', 'items'],
    optional: ['driverId', 'notes', 'metadata']
  },
  user: {
    required: ['name', 'email', 'type'],
    optional: ['phone', 'location', 'metadata']
  }
}

