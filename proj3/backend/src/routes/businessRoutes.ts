import { Router } from 'express'
import { getMenuItem, getMenuItems, getRestaurant, listRestaurants } from '../services/restaurantService'

const router = Router()

router.get('/', async (req, res) => {
  const { type, zip } = req.query as { type?: string; zip?: string }
  try {
    const data = await listRestaurants({ type, zip })
    res.json({ businesses: data })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch businesses' })
  }
})

router.get('/:id', async (req, res) => {
  const restaurant = await getRestaurant(req.params.id)
  if (!restaurant) return res.status(404).json({ error: 'Business not found' })
  res.json(restaurant)
})

router.get('/:id/menu', async (req, res) => {
  const restaurant = await getRestaurant(req.params.id)
  if (!restaurant) return res.status(404).json({ error: 'Business not found' })
  const menu = await getMenuItems(req.params.id)
  res.json({ restaurant, menu })
})

router.get('/:id/menu/:itemId', async (req, res) => {
  const item = await getMenuItem(req.params.id, req.params.itemId)
  if (!item) return res.status(404).json({ error: 'Menu item not found' })
  res.json(item)
})

export default router
