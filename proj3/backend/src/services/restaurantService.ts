import { query } from '../db/pool'

export interface Restaurant {
  id: string
  name: string
  type: string
  category: string
  description?: string
  image?: string
  address?: string
  zip_code?: string
  lat?: number
  lng?: number
}

export interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  description?: string
  price_cents: number
  category?: string
}

export async function listRestaurants(filters: { type?: string; zip?: string } = {}): Promise<Restaurant[]> {
  const clauses: string[] = []
  const params: any[] = []

  if (filters.type) {
    params.push(filters.type)
    clauses.push(`type = $${params.length}`)
  }
  if (filters.zip) {
    params.push(filters.zip)
    clauses.push(`zip_code = $${params.length}`)
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const res = await query<Restaurant>(`SELECT * FROM restaurants ${where} ORDER BY name`, params)
  return res.rows
}

export async function getRestaurant(id: string): Promise<Restaurant | undefined> {
  const res = await query<Restaurant>('SELECT * FROM restaurants WHERE id = $1', [id])
  return res.rows[0]
}

export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const res = await query<MenuItem>('SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY name', [restaurantId])
  return res.rows
}

export async function getMenuItem(restaurantId: string, itemId: string): Promise<MenuItem | undefined> {
  const res = await query<MenuItem>('SELECT * FROM menu_items WHERE restaurant_id = $1 AND id = $2', [restaurantId, itemId])
  return res.rows[0]
}
