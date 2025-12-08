import { db, getUser } from '../dataStore'
import { formatCurrencyFromCents, isEventWithinRadius } from '../utils'
import { ActivityFeedEvent, FeedItem, Pool, User } from '../types'

type FeedFilter = 'all' | 'upcoming' | 'recent'

function getRelevantDate(event: ActivityFeedEvent): Date {
  const windowStart = event.metadata?.windowStart ? new Date(event.metadata.windowStart) : null
  const scheduled = event.metadata?.scheduledTime ? new Date(event.metadata.scheduledTime) : null
  if (windowStart) return windowStart
  if (scheduled) return scheduled
  return new Date(event.createdAt)
}

function isTimeRelevant(event: ActivityFeedEvent, filter: FeedFilter, now: Date): boolean {
  const eventDate = getRelevantDate(event)
  if (filter === 'upcoming') {
    const twoHoursFromNow = new Date(now.getTime() + 1000 * 60 * 120)
    return eventDate >= now && eventDate <= twoHoursFromNow
  }
  if (filter === 'recent') {
    const twentyFourHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24)
    return eventDate >= twentyFourHoursAgo && eventDate <= now
  }
  // "all" still limited to a reasonable window to keep feed relevant
  const twentyFourHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24)
  const twoHoursFromNow = new Date(now.getTime() + 1000 * 60 * 120)
  return eventDate >= twentyFourHoursAgo && eventDate <= twoHoursFromNow
}

function formatName(user: User | undefined, currentUserId: string): string {
  if (!user) return 'A neighbor'
  if (user.id === currentUserId) return 'You'
  if (user.privacyPreference === 'ANONYMOUS_NEIGHBOR') return 'A neighbor'
  return user.name.split(' ')[0]
}

function formatWindow(start?: string, end?: string): string {
  if (!start) return ''
  const startDate = new Date(start)
  const endDate = end ? new Date(end) : null
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
  if (endDate) {
    return `${startDate.toLocaleTimeString([], opts)}–${endDate.toLocaleTimeString([], opts)}`
  }
  return startDate.toLocaleTimeString([], opts)
}

function buildDisplayText(event: ActivityFeedEvent, currentUserId: string): string {
  const subjectUser = getUser(event.userId || '')
  const name = formatName(subjectUser, currentUserId)
  const errandType = event.metadata?.errandType || 'pool'

  switch (event.type) {
    case 'POOL_CREATED':
      return `${name} created a ${errandType} pool for ${formatWindow(event.metadata?.windowStart, event.metadata?.windowEnd)}.`
    case 'POOL_JOINED':
      return `${name} joined a ${errandType} starting ${formatWindow(event.metadata?.windowStart, event.metadata?.windowEnd)}.`
    case 'INCENTIVE_EARNED': {
      const amount = typeof event.metadata?.amountCents === 'number' ? formatCurrencyFromCents(event.metadata.amountCents) : 'a credit'
      if (subjectUser?.id === currentUserId) {
        return `You earned ${amount} for pooling.`
      }
      return `${name} earned ${amount} for a pool that filled up.`
    }
    case 'ERRAND_SCHEDULED':
      return `${name} scheduled a ${errandType} run for ${formatWindow(event.metadata?.scheduledTime)}.`
    default:
      return `${name} shared an update.`
  }
}

function isJoinable(event: ActivityFeedEvent, poolLookup: Record<string, Pool>, now: Date, currentUserId: string): boolean {
  if (!event.poolId) return false
  const pool = poolLookup[event.poolId]
  if (!pool) return false
  const start = new Date(pool.scheduledWindowStart)
  const alreadyJoined = pool.participantUserIds.includes(currentUserId)
  return pool.status === 'OPEN' && start > now && !alreadyJoined
}

export function getActivityFeed(userId: string, filter: FeedFilter, limit = 20): FeedItem[] {
  const user = getUser(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const now = new Date()
  const poolLookup = db.pools.reduce<Record<string, Pool>>((acc, pool) => {
    acc[pool.id] = pool
    return acc
  }, {})

  const filtered = db.activityFeedEvents
    .filter(event => isTimeRelevant(event, filter, now))
    .filter(event => isEventWithinRadius(event, user, poolLookup))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)

  return filtered.map(event => ({
    id: event.id,
    type: event.type,
    displayText: buildDisplayText(event, userId),
    createdAt: event.createdAt,
    isJoinable: isJoinable(event, poolLookup, now, userId),
    poolId: event.poolId || undefined
  }))
}
