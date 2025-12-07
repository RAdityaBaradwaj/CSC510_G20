// Standard Order Model
export class Order {
  constructor({
    id,
    customerId,
    customerName,
    businessId,
    businessName,
    driverId = null,
    status = 'pending',
    location,
    items = [],
    total = 0,
    notes = '',
    createdAt = new Date(),
    updatedAt = new Date(),
    metadata = {}
  }) {
    this.id = id
    this.customerId = customerId
    this.customerName = customerName
    this.businessId = businessId
    this.businessName = businessName
    this.driverId = driverId
    this.status = status
    this.location = location // { zipCode, lat, lng, address }
    this.items = items
    this.total = total
    this.notes = notes
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.metadata = metadata
    
    // Computed properties
    this.distance = null
  }

  // Serialize to JSON
  toJSON() {
    return {
      id: this.id,
      customerId: this.customerId,
      customerName: this.customerName,
      businessId: this.businessId,
      businessName: this.businessName,
      driverId: this.driverId,
      status: this.status,
      location: this.location,
      items: this.items,
      total: this.total,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata,
      distance: this.distance
    }
  }

  // Create from API response
  static fromAPIResponse(data) {
    return new Order({
      id: data.id,
      customerId: data.customerId,
      customerName: data.customerName || data.customer?.name,
      businessId: data.businessId,
      businessName: data.businessName || data.business?.name,
      driverId: data.driverId,
      status: data.status,
      location: data.location || data.deliveryLocation,
      items: data.items || [],
      total: data.total || 0,
      notes: data.notes || '',
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      metadata: data.metadata || {}
    })
  }

  // Validation
  validate() {
    const errors = []
    
    if (!this.customerId) errors.push('Customer ID is required')
    if (!this.businessId) errors.push('Business ID is required')
    if (!this.location) errors.push('Location is required')
    if (!Array.isArray(this.items)) errors.push('Items must be an array')
    if (this.items.length === 0) errors.push('Order must have at least one item')
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Status helpers
  canUpdateStatus() {
    const allowedStatuses = {
      pending: ['processing', 'cancelled'],
      processing: ['ready', 'cancelled'],
      ready: ['picked-up', 'cancelled'],
      'picked-up': ['delivered'],
      delivered: [],
      cancelled: []
    }
    return allowedStatuses[this.status] || []
  }

  isCancellable() {
    return ['pending', 'processing', 'ready'].includes(this.status)
  }
}

// Order Item Model
export class OrderItem {
  constructor({
    id,
    productId,
    productName,
    quantity,
    price,
    subtotal,
    metadata = {}
  }) {
    this.id = id
    this.productId = productId
    this.productName = productName
    this.quantity = quantity
    this.price = price
    this.subtotal = subtotal || quantity * price
    this.metadata = metadata
  }
}

export default Order
