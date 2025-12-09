import { Router } from 'express'
import { authenticateUser, loginUser, signupUser } from '../services/userAuthService'

const router = Router()

router.post('/signup', (req, res) => {
  const { name, email, password, address, location } = req.body || {}
  try {
    const { user, token } = signupUser({ name, email, password, address, location })
    res.status(201).json({ user, token })
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Signup failed' })
  }
})

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  try {
    const { user, token } = loginUser(email, password)
    res.json({ user, token })
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid credentials' })
  }
})

router.get('/me', (req, res) => {
  const token = (req.headers['authorization'] as string) || (req.headers['x-user-token'] as string) || ''
  const user = authenticateUser(token)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  res.json({ user })
})

export default router
