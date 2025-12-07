// Location Service - Handles all location-related operations
// Uses free OpenWeather Geocoding API for real zip code lookup

const isMockMode = () => {
  return import.meta.env.VITE_USE_MOCK_DATA === 'true'
}

// Free Geocoding API (no key needed)
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export const locationService = {
  // Convert zip code to coordinates using real API
  getCoordinatesFromZip: async (zipCode) => {
    // Try to get country code from zip format (US by default)
    const [zip, country = 'US'] = zipCode.includes(',') ? zipCode.split(',') : [zipCode, 'US']
    
    if (isMockMode()) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300))

      // Mock zip code to coordinates mapping
      const zipCodeMap = {
        '10001': { lat: 40.7505, lng: -73.9934, city: 'Manhattan', state: 'NY' },
        '90210': { lat: 34.0901, lng: -118.4065, city: 'Beverly Hills', state: 'CA' },
        '60601': { lat: 41.8827, lng: -87.6233, city: 'Chicago', state: 'IL' },
        '78701': { lat: 30.2672, lng: -97.7431, city: 'Austin', state: 'TX' },
        '33101': { lat: 25.7730, lng: -80.1931, city: 'Miami', state: 'FL' },
        '98101': { lat: 47.6080, lng: -122.3350, city: 'Seattle', state: 'WA' },
        '02101': { lat: 42.3601, lng: -71.0589, city: 'Boston', state: 'MA' },
        '97201': { lat: 45.5152, lng: -122.6784, city: 'Portland', state: 'OR' },
        '27519': { lat: 35.9047, lng: -79.0469, city: 'Carrboro', state: 'NC' },
        '10101': { lat: 40.7614, lng: -73.9776, city: 'New York', state: 'NY' },
        '90001': { lat: 33.9731, lng: -118.2479, city: 'Los Angeles', state: 'CA' },
        '94016': { lat: 37.7749, lng: -122.4194, city: 'San Francisco', state: 'CA' },
        '30301': { lat: 33.7490, lng: -84.3880, city: 'Atlanta', state: 'GA' },
      }

      const coords = zipCodeMap[zip]
      if (!coords) {
        const validCodes = Object.keys(zipCodeMap).join(', ')
        throw new Error(`Zip code ${zip} not found in mock data. Valid codes: ${validCodes}`)
      }

      return coords
    }

    // Real API call using free geocoding service
    try {
      // Search using zip code as a place name
      const response = await fetch(`${GEOCODING_API_URL}?name=${zip}&count=1&language=en&format=json`)
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.results || data.results.length === 0) {
        throw new Error(`No location found for zip code: ${zip}`)
      }
      
      const result = data.results[0]
      
      return {
        lat: result.latitude,
        lng: result.longitude,
        city: result.name,
        state: result.admin1 || 'Unknown'
      }
    } catch (error) {
      // Fallback to mock data if API fails or doesn't find location
      console.warn('Geocoding API failed, checking mock data:', error.message)
      
      // Check if we have it in mock data
      const zipCodeMap = {
        '10001': { lat: 40.7505, lng: -73.9934, city: 'Manhattan', state: 'NY' },
        '90210': { lat: 34.0901, lng: -118.4065, city: 'Beverly Hills', state: 'CA' },
        '60601': { lat: 41.8827, lng: -87.6233, city: 'Chicago', state: 'IL' },
        '78701': { lat: 30.2672, lng: -97.7431, city: 'Austin', state: 'TX' },
        '33101': { lat: 25.7730, lng: -80.1931, city: 'Miami', state: 'FL' },
        '98101': { lat: 47.6080, lng: -122.3350, city: 'Seattle', state: 'WA' },
        '02101': { lat: 42.3601, lng: -71.0589, city: 'Boston', state: 'MA' },
        '97201': { lat: 45.5152, lng: -122.6784, city: 'Portland', state: 'OR' },
        '27519': { lat: 35.9047, lng: -79.0469, city: 'Carrboro', state: 'NC' },
        '10101': { lat: 40.7614, lng: -73.9776, city: 'New York', state: 'NY' },
        '90001': { lat: 33.9731, lng: -118.2479, city: 'Los Angeles', state: 'CA' },
        '94016': { lat: 37.7749, lng: -122.4194, city: 'San Francisco', state: 'CA' },
        '30301': { lat: 33.7490, lng: -84.3880, city: 'Atlanta', state: 'GA' },
      }
      
      const mockResult = zipCodeMap[zip]
      if (mockResult) {
        return mockResult
      }
      
      throw new Error(`Unable to geocode ${zip}. Try a well-known zip code like: 10001 (NYC), 90210 (Beverly Hills), or 27519 (Carrboro NC)`)
    }
  },

  // Validate address/location
  validateLocation: async (location) => {
    if (isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return { valid: true, location }
    } else {
      const { endpoints } = await import('./api/endpoints')
      const { api } = await import('./api/client')
      return api.post(endpoints.locations.validate(), location)
    }
  }
}
