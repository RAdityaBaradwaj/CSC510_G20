import { Router } from 'express'
import { getIncentivesSummary } from '../services/incentivesService'
import { resolveUserId } from './helpers'
import { updateUserPrivacy } from '../dataStore'

const router = Router()

const allowedPreferences = new Set(['PUBLIC_NAME', 'ANONYMOUS_NEIGHBOR'])

router.get('/me/incentives-summary', (req, res) => {
  const userId = resolveUserId(req)
  try {
    const summary = getIncentivesSummary(userId)
    res.json(summary)
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Unable to fetch incentives' })
  }
})

router.patch('/me/privacy', (req, res) => {
  const userId = resolveUserId(req)
  const { privacyPreference } = req.body || {}

  if (!allowedPreferences.has(privacyPreference)) {
    return res.status(400).json({ error: 'Invalid privacy preference' })
  }

  const updated = updateUserPrivacy(userId, privacyPreference)
  if (!updated) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json({ privacyPreference: updated.privacyPreference })
})

export default router
