// API Endpoint definitions
// Centralized endpoint management

const API_BASE = '/api'

export const endpoints = {
  // Orders
  orders: {
    base: `${API_BASE}/orders`,
    list: () => `${API_BASE}/orders`,
    byId: (id) => `${API_BASE}/orders/${id}`,
    nearby: () => `${API_BASE}/orders/nearby`,
    status: (id, status) => `${API_BASE}/orders/${id}/status/${status}`,
    assignDriver: (id) => `${API_BASE}/orders/${id}/assign-driver`,
    cancel: (id) => `${API_BASE}/orders/${id}/cancel`
  },

  // Users
  users: {
    base: `${API_BASE}/users`,
    list: () => `${API_BASE}/users`,
    byId: (id) => `${API_BASE}/users/${id}`,
    me: () => `${API_BASE}/users/me`
  },

  // Drivers
  drivers: {
    base: `${API_BASE}/drivers`,
    available: () => `${API_BASE}/drivers/available`,
    nearBy: () => `${API_BASE}/drivers/nearby`,
    byId: (id) => `${API_BASE}/drivers/${id}`
  },

  // Locations
  locations: {
    base: `${API_BASE}/locations`,
    fromZip: (zipCode) => `${API_BASE}/locations/zip/${zipCode}`,
    validate: () => `${API_BASE}/locations/validate`
  },

  // Auth
  auth: {
    login: () => `${API_BASE}/auth/login`,
    logout: () => `${API_BASE}/auth/logout`,
    register: () => `${API_BASE}/auth/register`,
    refresh: () => `${API_BASE}/auth/refresh`
  },

  // Pools
  pools: {
    base: `${API_BASE}/pools`,
    list: () => `${API_BASE}/pools`,
    detail: (id) => `${API_BASE}/pools/${id}`,
    addOrders: (id) => `${API_BASE}/pools/${id}/orders`,
    removeOrder: (id, orderId) => `${API_BASE}/pools/${id}/orders/${orderId}`,
    assign: (id) => `${API_BASE}/pools/${id}/assign`,
    start: (id) => `${API_BASE}/pools/${id}/start`,
    complete: (id) => `${API_BASE}/pools/${id}/complete`,
    suggestions: () => `${API_BASE}/pools/suggestions`,
    optimize: (id) => `${API_BASE}/pools/${id}/optimize`
  }
}

export default endpoints
