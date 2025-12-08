import { describe, it, expect } from 'vitest'
import { isAdmin, validateAdminCredentials, getAdminPlaceholderInfo } from './adminAuth'

describe('adminAuth helpers', () => {
  it('recognizes whitelisted admin emails', () => {
    expect(isAdmin({ email: 'admin@neighborhoodpool.com' })).toBe(true)
    expect(isAdmin({ email: 'Admin@example.com' })).toBe(true) // case-insensitive
    expect(isAdmin({ email: 'user@example.com' })).toBe(false)
    expect(isAdmin(null)).toBe(false)
  })

  it('validates admin credentials', () => {
    expect(validateAdminCredentials('admin@neighborhoodpool.com', 'admin123')).toBe(true)
    expect(validateAdminCredentials('admin@example.com', 'admin123')).toBe(true)
    expect(validateAdminCredentials('admin@example.com', 'wrong')).toBe(false)
    expect(validateAdminCredentials('user@example.com', 'admin123')).toBe(false)
  })

  it('returns placeholder admin info for display', () => {
    const info = getAdminPlaceholderInfo()
    expect(info.email).toBeDefined()
    expect(info.password).toBeDefined()
    expect(info.note).toMatch(/admin/i)
  })
})
