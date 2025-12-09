// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
import { resetStore, db } from '../src/dataStore'
import { signupUser, loginUser, authenticateUser } from '../src/services/userAuthService'

describe('userAuthService', () => {
  beforeEach(() => {
    resetStore()
  })

  it('signs up a new user and issues a token', () => {
    const { user, token } = signupUser({ name: 'Test', email: 'newuser@example.com', password: 'secret' })
    expect(user.email).toBe('newuser@example.com')
    expect(token).toBeDefined()
    const authUser = authenticateUser(token)
    expect(authUser?.email).toBe('newuser@example.com')
  })

  it('rejects duplicate signup for same email', () => {
    signupUser({ name: 'Test', email: 'dupe@example.com', password: 'secret' })
    expect(() => signupUser({ name: 'Test 2', email: 'dupe@example.com', password: 'secret2' }))
      .toThrow(/already exists/i)
  })

  it('logs in seeded user and rejects wrong password', () => {
    // seeded user-1 has password "password123"
    const { token } = loginUser('alex@example.com', 'password123')
    const authUser = authenticateUser(token)
    expect(authUser?.email).toBe('alex@example.com')
    expect(() => loginUser('alex@example.com', 'badpass')).toThrow(/invalid/i)
  })
})
