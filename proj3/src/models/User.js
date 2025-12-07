// Standard User Model
export class User {
  constructor({
    id,
    type = 'customer', // 'customer', 'driver', 'business'
    name,
    email,
    phone = '',
    location = null,
    metadata = {}
  }) {
    this.id = id
    this.type = type
    this.name = name
    this.email = email
    this.phone = phone
    this.location = location
    this.metadata = metadata
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      email: this.email,
      phone: this.phone,
      location: this.location,
      metadata: this.metadata
    }
  }

  static fromAPIResponse(data) {
    return new User({
      id: data.id,
      type: data.type,
      name: data.name,
      email: data.email,
      phone: data.phone,
      location: data.location,
      metadata: data.metadata
    })
  }

  validate() {
    const errors = []
    if (!this.name) errors.push('Name is required')
    if (!this.email) errors.push('Email is required')
    if (!['customer', 'driver', 'business'].includes(this.type)) {
      errors.push('Invalid user type')
    }
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  isCustomer() {
    return this.type === 'customer'
  }

  isDriver() {
    return this.type === 'driver'
  }

  isBusiness() {
    return this.type === 'business'
  }
}

export default User
