// Utility functions for calculating distances between geographic coordinates

export const distanceCalculator = {
  // Calculate distance between two points using Haversine formula
  // Returns distance in kilometers
  calculateDistance: (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1)
    const dLng = toRadians(lng2 - lng1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    
    return distance
  },

  // Calculate distance in miles
  calculateDistanceInMiles: (lat1, lng1, lat2, lng2) => {
    const kmDistance = distanceCalculator.calculateDistance(lat1, lng1, lat2, lng2)
    return kmDistance * 0.621371 // Convert km to miles
  },

  // Check if a point is within a given radius of another point
  isWithinRadius: (centerLat, centerLng, pointLat, pointLng, radiusKm) => {
    const distance = distanceCalculator.calculateDistance(centerLat, centerLng, pointLat, pointLng)
    return distance <= radiusKm
  },

  // Get bounding box for a given center point and radius
  getBoundingBox: (centerLat, centerLng, radiusKm) => {
    const latDelta = radiusKm / 111.0 // Rough conversion: 1 degree ≈ 111 km
    const lngDelta = radiusKm / (111.0 * Math.cos(toRadians(centerLat)))
    
    return {
      north: centerLat + latDelta,
      south: centerLat - latDelta,
      east: centerLng + lngDelta,
      west: centerLng - lngDelta
    }
  },

  // Format distance for display
  formatDistance: (distanceKm, unit = 'km') => {
    if (unit === 'miles') {
      const miles = distanceKm * 0.621371
      return miles < 1 ? `${(miles * 5280).toFixed(0)} ft` : `${miles.toFixed(2)} mi`
    } else {
      return distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)} m` : `${distanceKm.toFixed(2)} km`
    }
  }
}

// Helper function to convert degrees to radians
function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}
