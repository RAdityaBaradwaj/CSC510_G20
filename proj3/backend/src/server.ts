import express from 'express'
import activityFeedRoutes from './routes/activityFeedRoutes'
import poolRoutes from './routes/poolRoutes'
import userRoutes from './routes/userRoutes'
import businessRoutes from './routes/businessRoutes'
import restaurantAuthRoutes from './routes/restaurantAuthRoutes'
import restaurantOrdersRoutes from './routes/restaurantOrdersRoutes'
import authRoutes from './routes/authRoutes'
import { seedRestaurants } from './db/seedRestaurants'
import { pool } from './db/pool'

const app = express()

// Seed data for restaurants/menus on startup if missing
seedRestaurants().catch(err => {
  // eslint-disable-next-line no-console
  console.error('Restaurant seed failed', err)
})

// CORS for local dev (frontend http://localhost:5173)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// Simple auth shim: use x-user-id header if provided, otherwise default to a seeded user
app.use((req, _res, next) => {
  ;(req as any).userId = (req.headers['x-user-id'] as string) || 'user-1'
  next()
})

app.use(express.json())

app.use('/api', activityFeedRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/pools', poolRoutes)
app.use('/api/users', userRoutes)
app.use('/api/businesses', businessRoutes)
app.use('/api/restaurants', restaurantAuthRoutes)
app.use('/api/restaurants', restaurantOrdersRoutes)

const port = process.env.PORT || 4000
if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`NeighborhoodPool backend listening on port ${port}`)
  })
}

export default app
