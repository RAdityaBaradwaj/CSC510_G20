import { db, generateId } from '../dataStore'
import { User } from '../types'
import { validateAdminCredentials } from '../utils'

const tokenMap = new Map<string, string>() // token -> userId

export function signupUser(payload: { name: string; email: string; password: string; address?: string; location?: { lat: number; lng: number } }): { user: User; token: string } {
  const email = (payload.email || '').toLowerCase()
  if (!email || !payload.password) {
    throw new Error('Email and password are required')
  }
  const existing = db.users.find(u => u.email.toLowerCase() === email)
  if (existing) {
    throw new Error('A user with this email already exists')
  }
  const user: User = {
    id: generateId('user'),
    name: payload.name || email.split('@')[0],
    email,
    address: payload.address || '',
    location: payload.location || { lat: 0, lng: 0 },
    privacyPreference: 'PUBLIC_NAME',
    totalCreditsCents: 0,
    password: payload.password
  }
  db.users.push(user)
  const token = issueToken(user.id)
  return { user: stripPassword(user), token }
}

export function loginUser(email: string, password: string): { user: User; token: string } {
  const normalized = (email || '').toLowerCase()
  const user = db.users.find(u => u.email.toLowerCase() === normalized)
  if (!user || user.password !== password) {
    // simple admin check for demo parity
    if (validateAdminCredentials(email, password)) {
      const admin: User = {
        id: generateId('admin'),
        name: 'Admin',
        email: normalized,
        address: '',
        location: { lat: 0, lng: 0 },
        privacyPreference: 'PUBLIC_NAME',
        totalCreditsCents: 0,
        password
      }
      const token = issueToken(admin.id)
      return { user: stripPassword(admin), token }
    }
    throw new Error('Invalid credentials')
  }
  const token = issueToken(user.id)
  return { user: stripPassword(user), token }
}

export function authenticateUser(token?: string): User | null {
  if (!token) return null
  const id = tokenMap.get(token)
  if (!id) return null
  const user = db.users.find(u => u.id === id)
  return user ? stripPassword(user) : null
}

function issueToken(userId: string) {
  const token = generateId('user-token')
  tokenMap.set(token, userId)
  return token
}

function stripPassword(user: User): User {
  const { password, ...rest } = user
  return rest as User
}
