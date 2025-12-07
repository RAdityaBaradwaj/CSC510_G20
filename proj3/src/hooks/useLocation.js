import { useState, useEffect, useCallback } from 'react'
import { locationService } from '../services/locationService'

// Custom hook for managing user location state and operations
export const useLocation = () => {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [permission, setPermission] = useState('unknown')

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const currentLocation = await locationService.getCurrentLocation()
      setLocation(currentLocation)
      return currentLocation
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Check location permission
  const checkPermission = useCallback(async () => {
    try {
      const permissionStatus = await locationService.checkPermission()
      setPermission(permissionStatus)
      return permissionStatus
    } catch (err) {
      console.error('Error checking permission:', err)
      return 'unknown'
    }
  }, [])

  // Watch location for real-time updates
  const watchLocation = useCallback((callback) => {
    return locationService.watchLocation(
      (newLocation) => {
        setLocation(newLocation)
        if (callback) callback(newLocation)
      },
      (err) => {
        setError(err.message)
        console.error('Location watch error:', err)
      }
    )
  }, [])

  // Stop watching location
  const stopWatching = useCallback((watchId) => {
    locationService.stopWatching(watchId)
  }, [])

  // Check permission on mount
  useEffect(() => {
    checkPermission()
  }, [checkPermission])

  return {
    location,
    loading,
    error,
    permission,
    getCurrentLocation,
    checkPermission,
    watchLocation,
    stopWatching
  }
}
