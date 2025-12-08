import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export const businessService = {
  // Get all businesses
  getAllBusinesses: async () => {
    const res = await axios.get(`${API_BASE}/api/businesses`)
    return (res.data.businesses || []).map(normalizeBusiness)
  },

  // Get business by ID
  getBusinessById: async (businessId) => {
    const res = await axios.get(`${API_BASE}/api/businesses/${businessId}`)
    return normalizeBusiness(res.data)
  },

  // Get businesses by type
  getBusinessesByType: async (type) => {
    const res = await axios.get(`${API_BASE}/api/businesses`, { params: { type } })
    return (res.data.businesses || []).map(normalizeBusiness)
  },

  // Get businesses by zip code
  getBusinessesByZipCode: async (zipCode) => {
    const res = await axios.get(`${API_BASE}/api/businesses`, { params: { zip: zipCode } })
    return (res.data.businesses || []).map(normalizeBusiness)
  },

// Get menu items for a business
  getMenuItems: async (businessId) => {
    const res = await axios.get(`${API_BASE}/api/businesses/${businessId}/menu`)
    return res.data.menu.map(item => ({
      ...item,
      price: item.price_cents / 100
    }))
  },

  // Get menu item by ID
  getMenuItemById: async (businessId, itemId) => {
    const res = await axios.get(`${API_BASE}/api/businesses/${businessId}/menu/${itemId}`)
    const item = res.data
    return { ...item, price: item.price_cents / 100 }
  }
}

function normalizeBusiness(business) {
  if (!business) return business
  return {
    ...business,
    location: business.location || {
      lat: business.lat,
      lng: business.lng,
      address: business.address,
      zipCode: business.zip_code
    }
  }
}

export default businessService
