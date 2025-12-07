import { useState, useEffect, useCallback } from 'react'
import { orderService } from '../services/orders/orderService'
import { trackStart, trackSuccess, trackFailure } from '../utils/analytics'

// Custom hook for managing nearby orders state and operations
export const useNearbyOrders = (userLocation, radius, statusFilter) => {
  const [nearbyOrders, setNearbyOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch nearby orders
  const fetchNearbyOrders = useCallback(async () => {
    if (!userLocation) {
      setNearbyOrders([])
      return
    }

    try {
      trackStart('fetch-nearby-orders')
      setLoading(true)
      setError(null)
      const orders = await orderService.getNearbyOrders(userLocation, radius, statusFilter)
      setNearbyOrders(orders)
      trackSuccess('fetch-nearby-orders', { count: orders.length, radius, statusFilter })
    } catch (err) {
      setError(err.message)
      console.error('Error fetching nearby orders:', err)
      trackFailure('fetch-nearby-orders', { error: err.message })
    } finally {
      setLoading(false)
    }
  }, [userLocation, radius, statusFilter])

  // Refetch orders (useful after updates)
  const refetch = useCallback(() => {
    fetchNearbyOrders()
  }, [fetchNearbyOrders])

  // Auto-fetch when dependencies change
  useEffect(() => {
    fetchNearbyOrders()
  }, [fetchNearbyOrders])

  // Update order status
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      // Update local state immediately for better UX
      setNearbyOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      )
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  // Get order by ID
  const getOrderById = useCallback(async (orderId) => {
    try {
      return await orderService.getOrderById(orderId)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  return {
    nearbyOrders,
    loading,
    error,
    refetch,
    updateOrderStatus,
    getOrderById
  }
}
