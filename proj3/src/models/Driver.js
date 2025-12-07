// Driver Model
export class Driver {
  constructor({
    id,
    name,
    email,
    phone,
    zipCodes = [], // Array of zip codes this driver serves
    currentLocation = null, // { lat, lng } - current driver location
    status = 'available', // 'available', 'on-delivery', 'offline'
    vehicleInfo = {},
    metadata = {}
  }) {
    this.id = id
    this.name = name
    this.email = email
    this.phone = phone
    this.zipCodes = zipCodes
    this.currentLocation = currentLocation
    this.status = status
    this.vehicleInfo = vehicleInfo
    this.metadata = metadata
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      zipCodes: this.zipCodes,
      currentLocation: this.currentLocation,
      status: this.status,
      vehicleInfo: this.vehicleInfo,
      metadata: this.metadata
    }
  }

  static fromAPIResponse(data) {
    return new Driver({
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      zipCodes: data.zipCodes || [],
      currentLocation: data.currentLocation,
      status: data.status || 'available',
      vehicleInfo: data.vehicleInfo || {},
      metadata: data.metadata || {}
    })
  }

  validate() {
    const errors = []
    if (!this.name) errors.push('Driver name is required')
    if (!this.email) errors.push('Driver email is required')
    if (!Array.isArray(this.zipCodes)) errors.push('Zip codes must be an array')
    if (this.zipCodes.length === 0) errors.push('Driver must be assigned to at least one zip code')
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Check if driver serves a specific zip code
  servesZipCode(zipCode) {
    return this.zipCodes.includes(zipCode)
  }

  // Check if driver is available for new assignments
  isAvailable() {
    return this.status === 'available'
  }
}

export default Driver

