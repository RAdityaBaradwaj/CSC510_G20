export type ActivityEventType = 'POOL_CREATED' | 'POOL_JOINED' | 'INCENTIVE_EARNED' | 'ERRAND_SCHEDULED'
export type IncentiveSourceType = 'POOL_JOIN' | 'POOL_CREATOR_REWARD'
export type PrivacyPreference = 'PUBLIC_NAME' | 'ANONYMOUS_NEIGHBOR'

export interface GeoPoint {
  lat: number
  lng: number
}

export interface User {
  id: string
  name: string
  email: string
  address: string
  location: GeoPoint
  privacyPreference: PrivacyPreference
  totalCreditsCents: number
  password?: string // demo only, do not store plaintext in production
}

export interface Errand {
  id: string
  userId: string
  type: 'pharmacy' | 'grocery' | 'package_return' | 'pooled'
  status: 'SCHEDULED' | 'PENDING' | 'COMPLETED'
  createdAt: string
  scheduledTime: string
  location: GeoPoint
}

export interface Pool {
  id: string
  creatorUserId: string
  status: 'OPEN' | 'SCHEDULED' | 'COMPLETED'
  createdAt: string
  scheduledWindowStart: string
  scheduledWindowEnd: string
  participantUserIds: string[]
  errandIds: string[]
  location: GeoPoint
  errandType: Errand['type']
}

export interface ActivityFeedEvent {
  id: string
  type: ActivityEventType
  userId?: string | null
  poolId?: string | null
  errandId?: string | null
  createdAt: string
  metadata: Record<string, any>
}

export interface UserIncentiveLedger {
  id: string
  userId: string
  sourceType: IncentiveSourceType
  sourceId?: string | null
  amountCents: number
  description?: string
  createdAt: string
}

export interface FeedItem {
  id: string
  type: ActivityEventType
  displayText: string
  createdAt: string
  isJoinable: boolean
  poolId?: string | null
}

export interface RestaurantAccount {
  id: string
  name: string
  email: string
  password: string // plaintext for demo only; do not use in prod
  restaurantId?: string // optional link to existing restaurant row
  address: string
  menu: RestaurantMenuItem[]
}

export interface RestaurantOrderItem {
  name: string
  quantity: number
  priceCents: number
}

export type RestaurantOrderStatus = 'pending' | 'preparing' | 'ready' | 'completed'

export interface RestaurantOrder {
  id: string
  restaurantId: string
  customerName: string
  items: RestaurantOrderItem[]
  totalCents: number
  status: RestaurantOrderStatus
  createdAt: string
}

export interface RestaurantMenuItem {
  id: string
  name: string
  description?: string
  priceCents: number
  category?: string
}
