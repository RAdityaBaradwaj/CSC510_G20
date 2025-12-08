import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

function authHeaders(userId?: string) {
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'x-user-id': userId } : {})
    }
  }
}

export async function fetchActivityFeed(filter: 'all' | 'upcoming' | 'recent' = 'upcoming', limit = 20, userId?: string) {
  const url = `${API_BASE}/api/activity-feed?filter=${filter}&limit=${limit}`
  const response = await axios.get(url, authHeaders(userId))
  return response.data.items
}

export async function joinPool(poolId: string, userId?: string) {
  const url = `${API_BASE}/api/pools/${poolId}/join`
  const response = await axios.post(url, {}, authHeaders(userId))
  return response.data
}

export async function fetchIncentivesSummary(userId?: string) {
  const url = `${API_BASE}/api/users/me/incentives-summary`
  const response = await axios.get(url, authHeaders(userId))
  return response.data
}

export async function updatePrivacyPreference(privacyPreference: 'PUBLIC_NAME' | 'ANONYMOUS_NEIGHBOR', userId?: string) {
  const url = `${API_BASE}/api/users/me/privacy`
  const response = await axios.patch(url, { privacyPreference }, authHeaders(userId))
  return response.data
}
