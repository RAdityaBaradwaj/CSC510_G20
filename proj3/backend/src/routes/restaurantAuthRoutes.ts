import { Router } from 'express'
import { authenticateRestaurant, loginRestaurant, signupRestaurant } from '../services/restaurantAccountService'

const router = Router()

router.post('/signup', (req, res) => {
  const { name, email, password, restaurantId, address, menu } = req.body || {}
  if (!name || !email || !password || !address) {
    return res.status(400).json({ error: 'name, email, password, and address are required' })
  }
  if (!Array.isArray(menu) || menu.length === 0) {
    return res.status(400).json({ error: 'At least one menu item is required' })
  }
  try {
    const account = signupRestaurant({ name, email, password, restaurantId, address, menu })
    const { token } = loginRestaurant(email, password)
    res.status(201).json({ account, token })
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to sign up' })
  }
})

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  try {
    const { token, account } = loginRestaurant(email, password)
    res.json({ token, account })
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid credentials' })
  }
})

router.get('/me', (req, res) => {
  const token = (req.headers['x-restaurant-token'] as string) || ''
  const account = authenticateRestaurant(token)
  if (!account) return res.status(401).json({ error: 'Unauthorized' })
  res.json({ account })
})

export default router
