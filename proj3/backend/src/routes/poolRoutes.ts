import { Router } from 'express'
import { joinPool } from '../services/incentivesService'
import { resolveUserId } from './helpers'

const router = Router()

router.post('/:poolId/join', (req, res) => {
  const userId = resolveUserId(req)
  const { poolId } = req.params

  try {
    const result = joinPool(poolId, userId)
    res.json({
      pool: result.pool,
      incentives: result.incentives
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Unable to join pool' })
  }
})

export default router
