import { describe, expect, it, beforeEach } from 'vitest'
import { getActivityFeed } from '../src/services/activityFeedService'
import { addActivityEvent, resetStore } from '../src/dataStore'

describe('activity feed service', () => {
  beforeEach(() => {
    resetStore()
  })

  it('respects privacy preference and anonymizes neighbors', () => {
    const feed = getActivityFeed('user-1', 'all', 20)
    const anonItem = feed.find(item => item.id === 'event-2')
    expect(anonItem?.displayText).toContain('A neighbor')
  })

  it('filters out events outside the neighborhood radius', () => {
    const farEventTime = new Date().toISOString()
    addActivityEvent({
      id: 'event-far',
      type: 'POOL_CREATED',
      userId: 'user-1',
      poolId: null,
      errandId: null,
      createdAt: farEventTime,
      metadata: {
        errandType: 'grocery',
        windowStart: farEventTime,
        windowEnd: farEventTime,
        lat: 34.0522,
        lng: -118.2437
      }
    })

    const feed = getActivityFeed('user-1', 'all', 50)
    expect(feed.find(item => item.id === 'event-far')).toBeUndefined()
  })

  it('returns only upcoming events for the upcoming filter', () => {
    const feed = getActivityFeed('user-1', 'upcoming', 20)
    expect(feed.find(item => item.id === 'event-4')).toBeUndefined()
    expect(feed.length).toBeGreaterThan(0)
  })
})
