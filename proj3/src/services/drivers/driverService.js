// Driver Service - Handles driver-related operations

import { Driver } from '../../models/Driver'

// Mock driver data
const mockDrivers = [
  {
    id: 'DRV-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '555-0101',
    zipCodes: ['10001', '10002', '10003'],
    currentLocation: { lat: 40.7128, lng: -74.0060 },
    status: 'available',
    vehicleInfo: { type: 'car', licensePlate: 'ABC-123' },
    metadata: {}
  },
  {
    id: 'DRV-002',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '555-0102',
    zipCodes: ['10001', '10004'],
    currentLocation: { lat: 40.7589, lng: -73.9851 },
    status: 'available',
    vehicleInfo: { type: 'van', licensePlate: 'XYZ-789' },
    metadata: {}
  },
  {
    id: 'DRV-003',
    name: 'Mike Davis',
    email: 'mike.davis@example.com',
    phone: '555-0103',
    zipCodes: ['10005', '10006'],
    currentLocation: { lat: 40.7505, lng: -73.9934 },
    status: 'on-delivery',
    vehicleInfo: { type: 'truck', licensePlate: 'TRK-456' },
    metadata: {}
  }
]

const useMockAPI = () => {
  return import.meta.env.VITE_USE_MOCK_DATA !== 'false' || !import.meta.env.VITE_API_BASE_URL
}

export const driverService = {
  // Get all drivers
  getAllDrivers: async (filters = {}) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 300))
      let drivers = mockDrivers.map(d => Driver.fromAPIResponse(d))
      
      if (filters.status) {
        drivers = drivers.filter(d => d.status === filters.status)
      }
      if (filters.zipCode) {
        drivers = drivers.filter(d => d.servesZipCode(filters.zipCode))
      }
      
      return drivers
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.get(endpoints.drivers?.list() || '/api/drivers', { params: filters })
      return response.map(d => Driver.fromAPIResponse(d))
    }
  },

  // Get driver by ID
  getDriverById: async (id) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const driver = mockDrivers.find(d => d.id === id)
      if (!driver) throw new Error('Driver not found')
      return Driver.fromAPIResponse(driver)
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.get(endpoints.drivers?.byId(id) || `/api/drivers/${id}`)
      return Driver.fromAPIResponse(response)
    }
  },

  // Create driver
  createDriver: async (driverData) => {
    const newDriver = new Driver({
      ...driverData,
      id: `DRV-${Date.now()}`,
      status: driverData.status || 'available'
    })

    const validation = newDriver.validate()
    if (!validation.isValid) {
      throw new Error(`Driver validation failed: ${validation.errors.join(', ')}`)
    }

    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 500))
      mockDrivers.push(newDriver.toJSON())
      return newDriver
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.post(endpoints.drivers?.list() || '/api/drivers', newDriver.toJSON())
      return Driver.fromAPIResponse(response)
    }
  },

  // Update driver
  updateDriver: async (id, updates) => {
    if (useMockAPI()) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const driverIndex = mockDrivers.findIndex(d => d.id === id)
      if (driverIndex === -1) throw new Error('Driver not found')
      
      mockDrivers[driverIndex] = {
        ...mockDrivers[driverIndex],
        ...updates
      }
      
      return Driver.fromAPIResponse(mockDrivers[driverIndex])
    } else {
      const { endpoints } = await import('../api/endpoints')
      const { api } = await import('../api/client')
      const response = await api.put(endpoints.drivers?.byId(id) || `/api/drivers/${id}`, updates)
      return Driver.fromAPIResponse(response)
    }
  },

  // Update driver location
  updateDriverLocation: async (id, location) => {
    return driverService.updateDriver(id, { currentLocation: location })
  },

  // Update driver status
  updateDriverStatus: async (id, status) => {
    return driverService.updateDriver(id, { status })
  }
}

export default driverService

