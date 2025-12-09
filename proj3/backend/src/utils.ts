import { ActivityFeedEvent, Pool, User } from './types'

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function isEventWithinRadius(event: ActivityFeedEvent, user: User, poolLookup: Record<string, Pool>): boolean {
  const { lat, lng } = extractLocation(event, poolLookup)
  if (lat === null || lng === null) return false
  const distance = haversineDistanceKm(user.location.lat, user.location.lng, lat, lng)
  return distance <= 5 // 5km neighborhood radius
}

export function extractLocation(event: ActivityFeedEvent, poolLookup: Record<string, Pool>): { lat: number | null, lng: number | null } {
  if (typeof event.metadata?.lat === 'number' && typeof event.metadata?.lng === 'number') {
    return { lat: event.metadata.lat, lng: event.metadata.lng }
  }
  if (event.poolId && poolLookup[event.poolId]) {
    return poolLookup[event.poolId].location
  }
  return { lat: null, lng: null }
}

export function formatCurrencyFromCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function toRadians(deg: number) {
  return deg * (Math.PI / 180)
}

// Demo-only admin credential check reused in auth service
const ADMIN_EMAILS = new Set(['admin@neighborhoodpool.com', 'admin@example.com'])
const ADMIN_PASSWORDS: Record<string, string> = {
  'admin@neighborhoodpool.com': 'admin123',
  'admin@example.com': 'admin123'
}

export function validateAdminCredentials(email?: string, password?: string) {
  if (!email || !password) return false
  const norm = email.toLowerCase()
  return ADMIN_EMAILS.has(norm) && ADMIN_PASSWORDS[norm] === password
}
