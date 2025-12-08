import { describe, it, expect } from 'vitest'
import { Order } from './Order'

const baseOrder = {
  id: 'O1',
  customerId: 'C1',
  customerName: 'Test User',
  businessId: 'B1',
  businessName: 'Biz',
  location: { lat: 35, lng: -78, address: 'Drop' },
  pickupLocation: { lat: 35.01, lng: -78.01, address: 'Pickup' },
  items: [{ id: 'I1', productId: 'P1', productName: 'Item', quantity: 1, price: 1 }]
}

describe('Order model validation', () => {
  it('passes with valid pickup and dropoff locations', () => {
    const order = new Order(baseOrder)
    const result = order.validate()
    expect(result.isValid).toBe(true)
  })

  it('fails when pickup location missing lat/lng', () => {
    const order = new Order({
      ...baseOrder,
      pickupLocation: { lat: null, lng: null }
    })
    const result = order.validate()
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.toLowerCase().includes('pickup'))).toBe(true)
  })

  it('fails when dropoff location missing lat/lng', () => {
    const order = new Order({
      ...baseOrder,
      location: { lat: null, lng: null }
    })
    const result = order.validate()
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.toLowerCase().includes('customer location'))).toBe(true)
  })

  it('fails when no items are present', () => {
    const order = new Order({ ...baseOrder, items: [] })
    const result = order.validate()
    expect(result.isValid).toBe(false)
  })
})
