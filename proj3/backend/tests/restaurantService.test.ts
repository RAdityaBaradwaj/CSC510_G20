// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/db/pool', () => {
  return {
    query: vi.fn()
  }
})

import { query } from '../src/db/pool'
import { listRestaurants, getRestaurant, getMenuItems, getMenuItem } from '../src/services/restaurantService'

const mockRows = [
  { id: 'r1', name: 'Pizza Place', type: 'restaurant', zip_code: '27601' },
  { id: 'r2', name: 'Pharmacy', type: 'pharmacy', zip_code: '27603' }
]

describe('restaurantService', () => {
  beforeEach(() => {
    (query as any).mockReset()
  })

  it('lists restaurants with optional filters', async () => {
    (query as any).mockResolvedValue({ rows: mockRows })
    const results = await listRestaurants({ type: 'restaurant', zip: '27601' })
    expect(results).toEqual(mockRows)
    // ensure query called with parameterized filters
    const call = (query as any).mock.calls[0]
    expect(call[0]).toContain('SELECT * FROM restaurants')
    expect(call[1]).toEqual(['restaurant', '27601'])
  })

  it('gets a single restaurant', async () => {
    (query as any).mockResolvedValue({ rows: [mockRows[0]] })
    const result = await getRestaurant('r1')
    expect(result?.id).toBe('r1')
  })

  it('gets menu items for a restaurant', async () => {
    const menuRows = [{ id: 'm1', restaurant_id: 'r1', name: 'Slice', price_cents: 500 }]
    (query as any).mockResolvedValue({ rows: menuRows })
    const results = await getMenuItems('r1')
    expect(results).toEqual(menuRows)
  })

  it('gets a single menu item', async () => {
    const item = { id: 'm1', restaurant_id: 'r1', name: 'Slice', price_cents: 500 }
    (query as any).mockResolvedValue({ rows: [item] })
    const result = await getMenuItem('r1', 'm1')
    expect(result?.id).toBe('m1')
  })
})
