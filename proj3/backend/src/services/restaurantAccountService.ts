import { db, generateId } from '../dataStore'
import { RestaurantAccount, RestaurantOrder, RestaurantOrderStatus, RestaurantMenuItem } from '../types'

const tokenMap = new Map<string, string>() // token -> restaurantAccountId

export function signupRestaurant(payload: { name: string; email: string; password: string; restaurantId?: string; address: string; menu: RestaurantMenuItem[] }): RestaurantAccount {
  const existing = db.restaurantAccounts.find(r => r.email.toLowerCase() === payload.email.toLowerCase())
  if (existing) {
    throw new Error('A restaurant with this email already exists')
  }
  if (!payload.address || !payload.menu || payload.menu.length === 0) {
    throw new Error('Address and at least one menu item are required')
  }
  const menu = payload.menu.map(item => ({
    ...item,
    id: item.id || generateId('menu')
  }))
  const account: RestaurantAccount = {
    id: generateId('rest-acc'),
    name: payload.name,
    email: payload.email.toLowerCase(),
    password: payload.password,
    restaurantId: payload.restaurantId || '',
    address: payload.address,
    menu
  }
  db.restaurantAccounts.push(account)
  return account
}

export function loginRestaurant(email: string, password: string): { token: string; account: RestaurantAccount } {
  const account = db.restaurantAccounts.find(r => r.email.toLowerCase() === email.toLowerCase())
  if (!account || account.password !== password) {
    throw new Error('Invalid credentials')
  }
  const token = generateId('rest-token')
  tokenMap.set(token, account.id)
  return { token, account }
}

export function authenticateRestaurant(token?: string): RestaurantAccount | null {
  if (!token) return null
  const id = tokenMap.get(token)
  if (!id) return null
  return db.restaurantAccounts.find(r => r.id === id) || null
}

export function updateMenu(accountId: string, menu: RestaurantMenuItem[]): RestaurantAccount | null {
  const account = db.restaurantAccounts.find(r => r.id === accountId)
  if (!account) return null
  account.menu = (menu || []).map(item => ({ ...item, id: item.id || generateId('menu') }))
  return account
}

export function listRestaurantOrders(accountId: string): RestaurantOrder[] {
  const account = db.restaurantAccounts.find(r => r.id === accountId)
  if (!account) return []
  const restaurantId = account.restaurantId || account.id
  return db.restaurantOrders.filter(o => o.restaurantId === restaurantId)
}

export function addRestaurantOrder(order: Omit<RestaurantOrder, 'id' | 'createdAt'>): RestaurantOrder {
  const full: RestaurantOrder = {
    ...order,
    id: generateId('rest-order'),
    createdAt: new Date().toISOString()
  }
  db.restaurantOrders.push(full)
  return full
}

export function updateRestaurantOrderStatus(orderId: string, status: RestaurantOrderStatus): RestaurantOrder | null {
  const order = db.restaurantOrders.find(o => o.id === orderId)
  if (!order) return null
  order.status = status
  return order
}
