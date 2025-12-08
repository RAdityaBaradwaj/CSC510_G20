import { Router } from 'express'
import { getActivityFeed } from '../services/activityFeedService'
import { resolveUserId } from './helpers'

const router = Router()

const validFilters = new Set(['all', 'upcoming', 'recent'])

router.get('/activity-feed', (req, res) => {
  const userId = resolveUserId(req)
  const filter = (req.query.filter as string) || 'all'
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20

  if (!validFilters.has(filter)) {
    return res.status(400).json({ error: 'Invalid filter' })
  }

  try {
    const items = getActivityFeed(userId, filter as any, limit)
    res.json({ items })
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to fetch feed' })
  }
})

export default router
