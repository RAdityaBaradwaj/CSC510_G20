import { describe, test, expect } from 'vitest'
import { distanceCalculator } from '../../src/utils/distanceCalculator'

describe('Distance Calculator', () => {
  describe('calculateDistance', () => {
    test('calculates distance between two points correctly', () => {
      // Test distance between New York and Los Angeles (approximately 3944 km)
      const distance = distanceCalculator.calculateDistance(
        40.7128, -74.0060, // New York
        34.0522, -118.2437 // Los Angeles
      )
      
      expect(distance).toBeCloseTo(3944, -2) // Within 100km accuracy
    })

    test('returns zero for same coordinates', () => {
      const distance = distanceCalculator.calculateDistance(
        40.7128, -74.0060,
        40.7128, -74.0060
      )
      
      expect(distance).toBeCloseTo(0, 0)
    })

    test('calculates short distances accurately', () => {
      // Distance within NYC (approximately 10km)
      const distance = distanceCalculator.calculateDistance(
        40.7128, -74.0060, // Central Manhattan
        40.7589, -73.9851  // Upper East Side
      )
      
      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeLessThan(20)
    })
  })

  describe('calculateDistanceInMiles', () => {
    test('calculates distance in miles', () => {
      const distance = distanceCalculator.calculateDistanceInMiles(
        40.7128, -74.0060, // New York
        34.0522, -118.2437 // Los Angeles
      )
      
      expect(distance).toBeCloseTo(2450, -2) // Within 100 miles accuracy
    })

    test('converts kilometers to miles correctly', () => {
      const distanceKm = 1.609344 // 1 mile in km
      const distanceMiles = distanceCalculator.calculateDistanceInMiles(
        40.7128, -74.0060,
        40.7288, -74.0060 // Approximately 1.609344 km away
      )
      
      expect(distanceMiles).toBeGreaterThan(0)
      expect(distanceMiles).toBeLessThan(2)
    })
  })

  describe('isWithinRadius', () => {
    test('returns true for point within radius', () => {
      const isWithin = distanceCalculator.isWithinRadius(
        40.7128, -74.0060, // Center point
        40.7589, -73.9851, // Nearby point
        10 // 10km radius
      )
      
      expect(isWithin).toBe(true)
    })

    test('returns false for point outside radius', () => {
      const isWithin = distanceCalculator.isWithinRadius(
        40.7128, -74.0060, // New York
        34.0522, -118.2437, // Los Angeles
        10 // 10km radius (way too small)
      )
      
      expect(isWithin).toBe(false)
    })

    test('returns true for point exactly on radius', () => {
      const isWithin = distanceCalculator.isWithinRadius(
        40.7128, -74.0060,
        40.7589, -73.9851,
        100 // Large radius
      )
      
      expect(isWithin).toBe(true)
    })
  })

  describe('formatDistance', () => {
    test('formats distance in kilometers', () => {
      const formatted = distanceCalculator.formatDistance(1.5, 'km')
      expect(formatted).toBe('1.50 km')
    })

    test('formats short distances in meters', () => {
      const formatted = distanceCalculator.formatDistance(0.5, 'km')
      expect(formatted).toContain('m')
    })

    test('formats distance in miles', () => {
      const formatted = distanceCalculator.formatDistance(1.5, 'miles')
      expect(formatted).toContain('mi')
    })

    test('formats short distances in feet', () => {
      const formatted = distanceCalculator.formatDistance(0.001, 'miles')
      expect(formatted).toContain('ft')
    })
  })

  describe('getBoundingBox', () => {
    test('calculates bounding box correctly', () => {
      const bbox = distanceCalculator.getBoundingBox(
        40.7128, -74.0060, // Center
        5 // 5km radius
      )
      
      expect(bbox.north).toBeGreaterThan(bbox.south)
      expect(bbox.east).toBeGreaterThan(bbox.west)
      expect(bbox.north).toBeGreaterThan(40.7128)
      expect(bbox.south).toBeLessThan(40.7128)
    })
  })
})