import { describe, test, expect, beforeEach, vi } from 'vitest'
import { locationService } from '../../src/services/locationService'

describe('Location Service', () => {
  describe('getCoordinatesFromZip', () => {
    test('should return coordinates for valid zip code', async () => {
      const coords = await locationService.getCoordinatesFromZip('10001')
      
      expect(coords).toBeDefined()
      expect(coords.lat).toBeDefined()
      expect(coords.lng).toBeDefined()
      expect(typeof coords.lat).toBe('number')
      expect(typeof coords.lng).toBe('number')
    })

    test('should return correct coordinates for NYC', async () => {
      const coords = await locationService.getCoordinatesFromZip('10001')
      
      expect(coords.lat).toBeCloseTo(40.7505, 3)
      expect(coords.lng).toBeCloseTo(-73.9934, 3)
    })

    test('should return correct coordinates for Beverly Hills', async () => {
      const coords = await locationService.getCoordinatesFromZip('90210')
      
      expect(coords.lat).toBeCloseTo(34.0901, 3)
      expect(coords.lng).toBeCloseTo(-118.4065, 3)
    })

    test('should throw error for invalid zip code', async () => {
      await expect(locationService.getCoordinatesFromZip('99999')).rejects.toThrow('Zip code 99999 not found')
    })

    test('should throw error for empty zip code', async () => {
      await expect(locationService.getCoordinatesFromZip('')).rejects.toThrow()
    })
  })

  describe('validateLocation', () => {
    test('should validate correct location', async () => {
      const location = { lat: 40.7128, lng: -74.0060 }
      const result = await locationService.validateLocation(location)
      
      expect(result).toBeDefined()
      expect(result.valid).toBe(true)
      expect(result.location).toBeDefined()
    })

    test('should handle location validation async', async () => {
      const location = { lat: 40.7128, lng: -74.0060 }
      const promise = locationService.validateLocation(location)
      
      expect(promise).toBeInstanceOf(Promise)
      const result = await promise
      expect(result.valid).toBe(true)
    })
  })
})

