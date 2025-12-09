// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
import { resetStore, db } from '../src/dataStore'
import { signupRestaurant, loginRestaurant, updateMenu, listRestaurantOrders, addRestaurantOrder } from '../src/services/restaurantAccountService'

describe('restaurantAccountService', () => {
  beforeEach(() => {
    resetStore()
  })

  it('signs up a restaurant with required address and menu', () => {
    const account = signupRestaurant({
      name: 'Test Resto',
      email: 'resto@example.com',
      password: 'secret',
      address: '123 Test St',
      menu: [{ name: 'Dish', priceCents: 1000 }]
    })
    expect(account.email).toBe('resto@example.com')
    expect(account.menu.length).toBe(1)
  })

  it('rejects duplicate restaurant email', () => {
    signupRestaurant({
      name: 'Test Resto',
      email: 'dupe@example.com',
      password: 'secret',
      address: '123 Test St',
      menu: [{ name: 'Dish', priceCents: 1000 }]
    })
    expect(() => signupRestaurant({
      name: 'Another',
      email: 'dupe@example.com',
      password: 'secret2',
      address: '456 Test St',
      menu: [{ name: 'Dish2', priceCents: 1200 }]
    })).toThrow(/already exists/i)
  })

  it('updates menu and lists orders for restaurant', () => {
    const account = signupRestaurant({
      name: 'Test Resto',
      email: 'orders@example.com',
      password: 'secret',
      address: '123 Test St',
      menu: [{ name: 'Dish', priceCents: 1000 }]
    })
    updateMenu(account.id, [{ name: 'New Dish', priceCents: 1500 }])
    const updated = db.restaurantAccounts.find(r => r.id === account.id)
    expect(updated?.menu[0].name).toBe('New Dish')

    addRestaurantOrder({
      restaurantId: account.restaurantId || account.id,
      customerName: 'Cust',
      items: [{ name: 'New Dish', quantity: 1, priceCents: 1500 }],
      totalCents: 1500,
      status: 'pending'
    })
    const orders = listRestaurantOrders(account.id)
    expect(orders.length).toBe(1)
    expect(orders[0].totalCents).toBe(1500)
  })
})
