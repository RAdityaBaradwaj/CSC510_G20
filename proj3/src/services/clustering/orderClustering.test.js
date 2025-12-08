import { describe, it, expect } from 'vitest'
import { clusterOrders, optimizeRoute } from './orderClustering'

const mockDriver = (id = 'D1', lat = 35.0, lng = -78.0) => ({
  id,
  name: `Driver-${id}`,
  currentLocation: { lat, lng },
  isAvailable: () => true,
  isBusy: () => false
})

const order = (id, pickup, drop) => ({
  id,
  pickupLocation: pickup,
  businessLocation: pickup,
  location: drop
})

describe('detour-based clustering', () => {
  it('creates a single batch for one order with pickup then dropoff route', async () => {
    const orders = [
      order('O1', { lat: 35.0, lng: -78.0 }, { lat: 35.01, lng: -78.01 })
    ]
    const batches = await clusterOrders(orders, [mockDriver()])
    expect(batches.length).toBe(1)
    expect(batches[0].orders.map(o => o.id)).toEqual(['O1'])
    expect(batches[0].route[0].type).toBe('pickup')
    expect(batches[0].route[1].type).toBe('dropoff')
  })

  it('batches two on-the-way orders together when detour is small', async () => {
    const orders = [
      order('O1', { lat: 35.0, lng: -78.0 }, { lat: 35.02, lng: -78.0 }),
      // Pickup and dropoff sit close to the main corridor, should be accepted
      order('O2', { lat: 35.005, lng: -78.001 }, { lat: 35.015, lng: -78.001 })
    ]
    const batches = await clusterOrders(orders, [mockDriver()])
    expect(batches.length).toBe(1)
    expect(new Set(batches[0].orders.map(o => o.id))).toEqual(new Set(['O1', 'O2']))
    // Pickup must precede its own dropoff
    const o2PickupIdx = batches[0].route.findIndex(n => n.orderId === 'O2' && n.type === 'pickup')
    const o2DropIdx = batches[0].route.findIndex(n => n.orderId === 'O2' && n.type === 'dropoff')
    expect(o2PickupIdx).toBeGreaterThanOrEqual(0)
    expect(o2DropIdx).toBeGreaterThan(o2PickupIdx)
  })

  it('splits into separate batches when detour is too large', async () => {
    const orders = [
      order('O1', { lat: 35.0, lng: -78.0 }, { lat: 35.01, lng: -78.0 }),
      // Far away dropoff/pickup, should exceed 3km detour threshold
      order('O2', { lat: 35.2, lng: -78.2 }, { lat: 35.21, lng: -78.2 })
    ]
    const batches = await clusterOrders(orders, [mockDriver()])
    expect(batches.length).toBe(2)
    expect(batches[0].orders.length + batches[1].orders.length).toBe(2)
  })

  it('respects maxOrdersPerBatch cap even when detour is small', async () => {
    const orders = [
      order('O1', { lat: 35.0, lng: -78.0 }, { lat: 35.01, lng: -78.0 }),
      order('O2', { lat: 35.0, lng: -78.002 }, { lat: 35.012, lng: -78.002 }),
      order('O3', { lat: 35.0, lng: -78.004 }, { lat: 35.013, lng: -78.004 })
    ]
    const batches = await clusterOrders(orders, [mockDriver()], 2)
    expect(batches.length).toBeGreaterThanOrEqual(2)
    expect(batches[0].orders.length).toBeLessThanOrEqual(2)
  })

  it('uses driver start location when computing route distance/detour', async () => {
    const driver = mockDriver('D1', 35.05, -78.05) // farther from pickups
    const orders = [
      order('O1', { lat: 35.0, lng: -78.0 }, { lat: 35.01, lng: -78.0 }),
      order('O2', { lat: 35.0, lng: -78.001 }, { lat: 35.011, lng: -78.001 })
    ]
    const batches = await clusterOrders(orders, [driver])
    expect(batches.length).toBe(1)
    // route should start near the first pickup/drop corridor, not at driver, but driver affects distance
    const route = batches[0].route
    expect(route[0].type).toBe('pickup')
    expect(route.every(n => ['pickup', 'dropoff'].includes(n.type))).toBe(true)
  })
})

describe('optimizeRoute pickup-before-dropoff', () => {
  it('orders pickups before their corresponding dropoffs', () => {
    const orders = [
      order('O1', { lat: 35.0, lng: -78.0 }, { lat: 35.02, lng: -78.02 }),
      order('O2', { lat: 35.01, lng: -78.01 }, { lat: 35.03, lng: -78.03 })
    ]
    const route = optimizeRoute(orders, { lat: 35.0, lng: -78.0 }, null)
    const pickupIdx1 = route.findIndex(n => n.orderId === 'O1' && n.type === 'pickup')
    const dropIdx1 = route.findIndex(n => n.orderId === 'O1' && n.type === 'dropoff')
    const pickupIdx2 = route.findIndex(n => n.orderId === 'O2' && n.type === 'pickup')
    const dropIdx2 = route.findIndex(n => n.orderId === 'O2' && n.type === 'dropoff')
    expect(pickupIdx1).toBeLessThan(dropIdx1)
    expect(pickupIdx2).toBeLessThan(dropIdx2)
  })
})
