import { Router } from 'express'
import { authenticateRestaurant, listRestaurantOrders, updateRestaurantOrderStatus, updateMenu } from '../services/restaurantAccountService'

const router = Router()

router.use((req, res, next) => {
  const token = (req.headers['x-restaurant-token'] as string) || ''
  const account = authenticateRestaurant(token)
  if (!account) return res.status(401).json({ error: 'Unauthorized' })
  ;(req as any).restaurantAccount = account
  next()
})

router.get('/me/orders', (req, res) => {
  const account = (req as any).restaurantAccount
  const orders = listRestaurantOrders(account.id)
  res.json({ orders })
})

router.patch('/me/orders/:orderId/status', (req, res) => {
  const account = (req as any).restaurantAccount
  const { status } = req.body || {}
  if (!status) return res.status(400).json({ error: 'status is required' })
  const order = updateRestaurantOrderStatus(req.params.orderId, status)
  if (!order || order.restaurantId !== (account.restaurantId || account.id)) {
    return res.status(404).json({ error: 'Order not found' })
  }
  res.json({ order })
})

router.put('/me/menu', (req, res) => {
  const account = (req as any).restaurantAccount
  const { menu } = req.body || {}
  if (!Array.isArray(menu) || menu.length === 0) {
    return res.status(400).json({ error: 'menu is required and cannot be empty' })
  }
  const updated = updateMenu(account.id, menu)
  res.json({ menu: updated?.menu || [] })
})

export default router
