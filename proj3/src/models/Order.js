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
    pickupLocation = null,
    businessLocation = null,
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
    // Always keep the business pickup location alongside the delivery address for clustering
    this.pickupLocation = pickupLocation || businessLocation // { lat, lng, address }
    this.businessLocation = businessLocation || pickupLocation // mirror for clarity in UI/debugging
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
      pickupLocation: this.pickupLocation,
      businessLocation: this.businessLocation,
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
      pickupLocation: data.pickupLocation || data.storeLocation || data.businessLocation,
      businessLocation: data.businessLocation || data.storeLocation || data.pickupLocation,
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
    if (this.location && (!this.location.lat || !this.location.lng)) {
      errors.push('Customer location must include lat/lng for routing')
    }
    if (!this.pickupLocation) errors.push('Business pickup location is required')
    if (this.pickupLocation && (!this.pickupLocation.lat || !this.pickupLocation.lng)) {
      errors.push('Business pickup location must include lat/lng for routing')
    }
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
