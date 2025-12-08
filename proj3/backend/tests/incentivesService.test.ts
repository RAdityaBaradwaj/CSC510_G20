import { beforeEach, describe, expect, it } from 'vitest'
import { joinPool, getIncentivesSummary } from '../src/services/incentivesService'
import { db, resetStore } from '../src/dataStore'

describe('incentives service', () => {
  beforeEach(() => {
    resetStore()
  })

  it('applies join discount and rewards pool creator on first external join', () => {
    const result = joinPool('pool-2', 'user-1')

    expect(result.incentives.totalCreditsCents).toBeGreaterThanOrEqual(200)
    const creatorLedger = db.incentiveLedger.find(entry => entry.userId === 'user-3' && entry.sourceId === 'pool-2')
    expect(creatorLedger?.amountCents).toBe(300)
  })

  it('prevents duplicate joins from same user', () => {
    joinPool('pool-2', 'user-1')
    expect(() => joinPool('pool-2', 'user-1')).toThrowError()
    const summary = getIncentivesSummary('user-1')
    expect(summary.recentEntries.filter(entry => entry.sourceId === 'pool-2').length).toBe(1)
  })
})
