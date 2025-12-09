import { ActivityFeedEvent, Errand, Pool, PrivacyPreference, User, UserIncentiveLedger, RestaurantAccount, RestaurantOrder } from './types'

const now = new Date()

const users: User[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    address: '123 Main St, Brooklyn, NY',
    location: { lat: 40.6782, lng: -73.9442 },
    privacyPreference: 'PUBLIC_NAME',
    totalCreditsCents: 0,
    password: 'password123'
  },
  {
    id: 'user-2',
    name: 'Briana Lee',
    email: 'briana@example.com',
    address: '55 Court St, Brooklyn, NY',
    location: { lat: 40.6925, lng: -73.9903 },
    privacyPreference: 'ANONYMOUS_NEIGHBOR',
    totalCreditsCents: 0,
    password: 'password123'
  },
  {
    id: 'user-3',
    name: 'Carlos Mendez',
    email: 'carlos@example.com',
    address: '8 Greene Ave, Brooklyn, NY',
    location: { lat: 40.6863, lng: -73.9776 },
    privacyPreference: 'PUBLIC_NAME',
    totalCreditsCents: 0,
    password: 'password123'
  }
]

const errands: Errand[] = [
  {
    id: 'errand-1',
    userId: 'user-1',
    type: 'pharmacy',
    status: 'SCHEDULED',
    createdAt: new Date(now.getTime() - 1000 * 60 * 20).toISOString(),
    scheduledTime: new Date(now.getTime() + 1000 * 60 * 45).toISOString(),
    location: { lat: 40.6782, lng: -73.9442 }
  },
  {
    id: 'errand-2',
    userId: 'user-2',
    type: 'grocery',
    status: 'SCHEDULED',
    createdAt: new Date(now.getTime() - 1000 * 60 * 50).toISOString(),
    scheduledTime: new Date(now.getTime() + 1000 * 60 * 75).toISOString(),
    location: { lat: 40.6925, lng: -73.9903 }
  },
  {
    id: 'errand-3',
    userId: 'user-3',
    type: 'package_return',
    status: 'COMPLETED',
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
    scheduledTime: new Date(now.getTime() - 1000 * 60 * 60 * 11).toISOString(),
    location: { lat: 40.6863, lng: -73.9776 }
  }
]

const pools: Pool[] = [
  {
    id: 'pool-1',
    creatorUserId: 'user-1',
    status: 'OPEN',
    createdAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
    scheduledWindowStart: new Date(now.getTime() + 1000 * 60 * 40).toISOString(),
    scheduledWindowEnd: new Date(now.getTime() + 1000 * 60 * 90).toISOString(),
    participantUserIds: ['user-1'],
    errandIds: ['errand-1'],
    location: { lat: 40.6782, lng: -73.9442 },
    errandType: 'pharmacy'
  },
  {
    id: 'pool-2',
    creatorUserId: 'user-3',
    status: 'OPEN',
    createdAt: new Date(now.getTime() - 1000 * 60 * 35).toISOString(),
    scheduledWindowStart: new Date(now.getTime() + 1000 * 60 * 20).toISOString(),
    scheduledWindowEnd: new Date(now.getTime() + 1000 * 60 * 70).toISOString(),
    participantUserIds: ['user-3'],
    errandIds: [],
    location: { lat: 40.6863, lng: -73.9776 },
    errandType: 'grocery'
  },
  {
    id: 'pool-3',
    creatorUserId: 'user-2',
    status: 'COMPLETED',
    createdAt: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
    scheduledWindowStart: new Date(now.getTime() - 1000 * 60 * 160).toISOString(),
    scheduledWindowEnd: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
    participantUserIds: ['user-2', 'user-3'],
    errandIds: ['errand-3'],
    location: { lat: 40.6925, lng: -73.9903 },
    errandType: 'package_return'
  }
]

const activityFeedEvents: ActivityFeedEvent[] = [
  {
    id: 'event-1',
    type: 'POOL_CREATED',
    userId: 'user-1',
    poolId: 'pool-1',
    errandId: 'errand-1',
    createdAt: new Date(now.getTime() - 1000 * 60 * 12).toISOString(),
    metadata: {
      errandType: 'pharmacy',
      windowStart: pools[0].scheduledWindowStart,
      windowEnd: pools[0].scheduledWindowEnd,
      lat: pools[0].location.lat,
      lng: pools[0].location.lng
    }
  },
  {
    id: 'event-2',
    type: 'ERRAND_SCHEDULED',
    userId: 'user-2',
    errandId: 'errand-2',
    createdAt: new Date(now.getTime() - 1000 * 60 * 40).toISOString(),
    metadata: {
      errandType: 'grocery',
      scheduledTime: errands[1].scheduledTime,
      lat: errands[1].location.lat,
      lng: errands[1].location.lng
    }
  },
  {
    id: 'event-3',
    type: 'POOL_CREATED',
    userId: 'user-3',
    poolId: 'pool-2',
    createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
    metadata: {
      errandType: 'grocery',
      windowStart: pools[1].scheduledWindowStart,
      windowEnd: pools[1].scheduledWindowEnd,
      lat: pools[1].location.lat,
      lng: pools[1].location.lng
    }
  },
  {
    id: 'event-4',
    type: 'INCENTIVE_EARNED',
    userId: 'user-2',
    poolId: 'pool-3',
    createdAt: new Date(now.getTime() - 1000 * 60 * 150).toISOString(),
    metadata: {
      amountCents: 300,
      reason: 'POOL_CREATOR_REWARD'
    }
  }
]

const incentiveLedger: UserIncentiveLedger[] = [
  {
    id: 'ledger-1',
    userId: 'user-2',
    sourceType: 'POOL_CREATOR_REWARD',
    sourceId: 'pool-3',
    amountCents: 300,
    description: 'Credit for a neighbor joining your pool',
    createdAt: new Date(now.getTime() - 1000 * 60 * 140).toISOString()
  }
]

// Demo restaurant accounts and orders (in-memory)
const restaurantAccounts: RestaurantAccount[] = [
  {
    id: 'rest-acc-1',
    name: 'Oak City Pizza',
    email: 'oakcity@example.com',
    password: 'pizza123',
    restaurantId: '',
    address: '237 S Wilmington St, Raleigh, NC 27601',
    menu: [
      { id: 'm-1', name: 'Margherita Pie', description: 'Fresh mozzarella, basil, tomato sauce', priceCents: 1599, category: 'pizza' }
    ]
  }
]

const restaurantOrders: RestaurantOrder[] = []

recalculateTotals()

const seedState = JSON.parse(JSON.stringify({
  users,
  errands,
  pools,
  activityFeedEvents,
  incentiveLedger,
  restaurantAccounts,
  restaurantOrders
}))

export const db = {
  users,
  errands,
  pools,
  activityFeedEvents,
  incentiveLedger,
  restaurantAccounts,
  restaurantOrders
}

export function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
}

export function getUser(userId: string): User | undefined {
  return users.find(u => u.id === userId)
}

export function ensureUser(userId: string): User {
  const existing = getUser(userId)
  if (existing) return existing
  const user: User = {
    id: userId,
    name: 'Demo Neighbor',
    email: `${userId}@example.com`,
    address: 'Raleigh, NC',
    location: { lat: 35.7796, lng: -78.6382 },
    privacyPreference: 'PUBLIC_NAME',
    totalCreditsCents: 0
  }
  users.push(user)
  return user
}

export function updateUserPrivacy(userId: string, preference: PrivacyPreference): User | undefined {
  const user = getUser(userId)
  if (user) {
    user.privacyPreference = preference
  }
  return user
}

export function addActivityEvent(event: ActivityFeedEvent) {
  activityFeedEvents.unshift(event)
}

export function addLedgerEntry(entry: UserIncentiveLedger) {
  incentiveLedger.unshift(entry)
  recalculateTotals()
}

export function addErrand(errand: Errand) {
  errands.push(errand)
}

export function recalculateTotals() {
  users.forEach(user => {
    const total = incentiveLedger
      .filter(entry => entry.userId === user.id)
      .reduce((acc, entry) => acc + entry.amountCents, 0)
    user.totalCreditsCents = total
  })
}

export function resetStore() {
  const snapshot = JSON.parse(JSON.stringify(seedState))
  users.splice(0, users.length, ...snapshot.users)
  errands.splice(0, errands.length, ...snapshot.errands)
  pools.splice(0, pools.length, ...snapshot.pools)
  activityFeedEvents.splice(0, activityFeedEvents.length, ...snapshot.activityFeedEvents)
  incentiveLedger.splice(0, incentiveLedger.length, ...snapshot.incentiveLedger)
  restaurantAccounts.splice(0, restaurantAccounts.length, ...snapshot.restaurantAccounts)
  restaurantOrders.splice(0, restaurantOrders.length, ...snapshot.restaurantOrders)
  recalculateTotals()
}
