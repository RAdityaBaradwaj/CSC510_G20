import { addActivityEvent, addErrand, addLedgerEntry, db, ensureUser, generateId, getUser, recalculateTotals } from '../dataStore'
import { ActivityFeedEvent, Pool, UserIncentiveLedger } from '../types'

const JOIN_DISCOUNT_CENTS = 200
const CREATOR_REWARD_CENTS = 300

function findPool(poolId: string): Pool | undefined {
  return db.pools.find(pool => pool.id === poolId)
}

export function joinPool(poolId: string, userId: string) {
  const pool = findPool(poolId)
  if (!pool) {
    throw new Error('Pool not found')
  }
  const now = new Date()
  if (pool.status !== 'OPEN' || new Date(pool.scheduledWindowStart) <= now) {
    throw new Error('Pool is not joinable')
  }
  if (pool.participantUserIds.includes(userId)) {
    throw new Error('User already in pool')
  }

  pool.participantUserIds.push(userId)

  const errandId = generateId('errand')
  addErrand({
    id: errandId,
    userId,
    type: pool.errandType,
    status: 'SCHEDULED',
    createdAt: now.toISOString(),
    scheduledTime: pool.scheduledWindowStart,
    location: pool.location
  })
  pool.errandIds.push(errandId)

  const joinEvent: ActivityFeedEvent = {
    id: generateId('event'),
    type: 'POOL_JOINED',
    userId,
    poolId: pool.id,
    errandId,
    createdAt: now.toISOString(),
    metadata: {
      errandType: pool.errandType,
      windowStart: pool.scheduledWindowStart,
      windowEnd: pool.scheduledWindowEnd,
      lat: pool.location.lat,
      lng: pool.location.lng
    }
  }
  addActivityEvent(joinEvent)

  const joinLedger: UserIncentiveLedger = {
    id: generateId('ledger'),
    userId,
    sourceType: 'POOL_JOIN',
    sourceId: pool.id,
    amountCents: JOIN_DISCOUNT_CENTS,
    description: 'Discount for joining a pool',
    createdAt: now.toISOString()
  }
  addLedgerEntry(joinLedger)

  const hasCreatorReward = db.incentiveLedger.some(entry =>
    entry.userId === pool.creatorUserId &&
    entry.sourceType === 'POOL_CREATOR_REWARD' &&
    entry.sourceId === pool.id
  )

  const rewardCreator = pool.creatorUserId !== userId && pool.participantUserIds.length > 1 && !hasCreatorReward
  if (rewardCreator) {
    const rewardLedger: UserIncentiveLedger = {
      id: generateId('ledger'),
      userId: pool.creatorUserId,
      sourceType: 'POOL_CREATOR_REWARD',
      sourceId: pool.id,
      amountCents: CREATOR_REWARD_CENTS,
      description: 'Credit for creating a pool that another neighbor joined',
      createdAt: now.toISOString()
    }
    addLedgerEntry(rewardLedger)

    const creatorEvent: ActivityFeedEvent = {
      id: generateId('event'),
      type: 'INCENTIVE_EARNED',
      userId: pool.creatorUserId,
      poolId: pool.id,
      createdAt: now.toISOString(),
      metadata: {
        amountCents: CREATOR_REWARD_CENTS,
        source: 'POOL_CREATOR_REWARD'
      }
    }
    addActivityEvent(creatorEvent)
  }

  recalculateTotals()

  return {
    pool,
    incentives: getIncentivesSummary(userId)
  }
}

export function getIncentivesSummary(userId: string) {
  const user = ensureUser(userId)
  const ledgerEntries = db.incentiveLedger.filter(entry => entry.userId === userId)
  const lifetimeSavingsCents = ledgerEntries
    .filter(entry => entry.amountCents > 0)
    .reduce((acc, entry) => acc + entry.amountCents, 0)

  return {
    totalCreditsCents: user.totalCreditsCents,
    lifetimeSavingsCents,
    recentEntries: ledgerEntries.slice(0, 10),
    privacyPreference: user.privacyPreference
  }
}
