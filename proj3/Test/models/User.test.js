import { describe, test, expect } from 'vitest'
import { User } from '../../src/models/User'

describe('User Model', () => {
  describe('User Construction', () => {
    test('should create user with required fields', () => {
      const user = new User({
        id: 'USER-001',
        name: 'John Doe',
        email: 'john@example.com',
        type: 'customer'
      })

      expect(user).toBeInstanceOf(User)
      expect(user.id).toBe('USER-001')
      expect(user.name).toBe('John Doe')
      expect(user.type).toBe('customer')
    })

    test('should set default values', () => {
      const user = new User({
        id: 'USER-001',
        name: 'John Doe',
        email: 'john@example.com'
      })

      expect(user.type).toBe('customer')
      expect(user.phone).toBe('')
      expect(user.metadata).toEqual({})
    })
  })

  describe('toJSON', () => {
    test('should serialize user to JSON', () => {
      const user = new User({
        id: 'USER-001',
        name: 'John Doe',
        email: 'john@example.com',
        type: 'customer'
      })

      const json = user.toJSON()
      
      expect(json).toBeDefined()
      expect(json.id).toBe('USER-001')
      expect(json.name).toBe('John Doe')
    })
  })

  describe('fromAPIResponse', () => {
    test('should create user from API response', () => {
      const apiResponse = {
        id: 'USER-001',
        name: 'John Doe',
        email: 'john@example.com',
        type: 'driver',
        phone: '123-456-7890',
        location: { lat: 40.7128, lng: -74.0060 }
      }

      const user = User.fromAPIResponse(apiResponse)
      
      expect(user).toBeInstanceOf(User)
      expect(user.type).toBe('driver')
      expect(user.phone).toBe('123-456-7890')
    })
  })

  describe('validate', () => {
    test('should validate correct user', () => {
      const user = new User({
        id: 'USER-001',
        name: 'John Doe',
        email: 'john@example.com',
        type: 'customer'
      })

      const result = user.validate()
      
      expect(result.isValid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    test('should fail validation for missing name', () => {
      const user = new User({
        id: 'USER-001',
        email: 'john@example.com',
        type: 'customer'
      })

      const result = user.validate()
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Name is required')
    })

    test('should fail validation for missing email', () => {
      const user = new User({
        id: 'USER-001',
        name: 'John Doe',
        type: 'customer'
      })

      const result = user.validate()
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Email is required')
    })

    test('should fail validation for invalid user type', () => {
      const user = new User({
        id: 'USER-001',
        name: 'John Doe',
        email: 'john@example.com',
        type: 'invalid'
      })

      const result = user.validate()
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid user type')
    })
  })

  describe('type helpers', () => {
    test('isCustomer should return true for customer', () => {
      const user = new User({
        id: 'USER-001',
        name: 'John Doe',
        email: 'john@example.com',
        type: 'customer'
      })

      expect(user.isCustomer()).toBe(true)
      expect(user.isDriver()).toBe(false)
      expect(user.isBusiness()).toBe(false)
    })

    test('isDriver should return true for driver', () => {
      const user = new User({
        id: 'USER-001',
        name: 'John Doe',
        email: 'john@example.com',
        type: 'driver'
      })

      expect(user.isDriver()).toBe(true)
      expect(user.isCustomer()).toBe(false)
      expect(user.isBusiness()).toBe(false)
    })

    test('isBusiness should return true for business', () => {
      const user = new User({
        id: 'USER-001',
        name: 'John Doe',
        email: 'john@example.com',
        type: 'business'
      })

      expect(user.isBusiness()).toBe(true)
      expect(user.isCustomer()).toBe(false)
      expect(user.isDriver()).toBe(false)
    })
  })
})

