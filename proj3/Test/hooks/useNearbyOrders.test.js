import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useNearbyOrders } from '../../src/hooks/useNearbyOrders'

// Mock the order service
vi.mock('../../src/services/orders/orderService', () => ({
  orderService: {
    getNearbyOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
    getOrderById: vi.fn()
  }
}))

describe('useNearbyOrders Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should return initial empty state', () => {
    const { result } = renderHook(() =>
      useNearbyOrders({ lat: 40.7128, lng: -74.0060 }, 10, 'all')
    )

    expect(result.current.nearbyOrders).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  test('should fetch nearby orders', async () => {
    const mockOrders = [
      { id: 'ORD-001', customerName: 'John', status: 'pending', distance: 2.5 }
    ]

    const orderService = require('../../src/services/orders/orderService')
    orderService.orderService.getNearbyOrders.mockResolvedValue(mockOrders)

    const { result } = renderHook(() =>
      useNearbyOrders({ lat: 40.7128, lng: -74.0060 }, 10, 'all')
    )

    await waitFor(() => {
      expect(result.current.nearbyOrders).toEqual(mockOrders)
    })

    expect(orderService.orderService.getNearbyOrders).toHaveBeenCalledWith(
      { lat: 40.7128, lng: -74.0060 },
      10,
      'all'
    )
  })

  test('should handle errors', async () => {
    const orderService = require('../../src/services/orders/orderService')
    orderService.orderService.getNearbyOrders.mockRejectedValue(
      new Error('Test error')
    )

    const { result } = renderHook(() =>
      useNearbyOrders({ lat: 40.7128, lng: -74.0060 }, 10, 'all')
    )

    await waitFor(() => {
      expect(result.current.error).toBe('Test error')
    })
  })

  test('should not fetch when location is null', async () => {
    const orderService = require('../../src/services/orders/orderService')

    const { result } = renderHook(() =>
      useNearbyOrders(null, 10, 'all')
    )

    await waitFor(() => {
      expect(result.current.nearbyOrders).toEqual([])
    })

    expect(orderService.orderService.getNearbyOrders).not.toHaveBeenCalled()
  })

  test('should refetch orders', async () => {
    const orderService = require('../../src/services/orders/orderService')
    orderService.orderService.getNearbyOrders.mockResolvedValue([])

    const { result } = renderHook(() =>
      useNearbyOrders({ lat: 40.7128, lng: -74.0060 }, 10, 'all')
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.refetch()

    expect(orderService.orderService.getNearbyOrders).toHaveBeenCalledTimes(2)
  })

  test('should update order status', async () => {
    const orderService = require('../../src/services/orders/orderService')
    orderService.orderService.updateOrderStatus.mockResolvedValue({
      id: 'ORD-001',
      status: 'processing'
    })

    const { result } = renderHook(() =>
      useNearbyOrders({ lat: 40.7128, lng: -74.0060 }, 10, 'all')
    )

    await result.current.updateOrderStatus('ORD-001', 'processing')

    expect(orderService.orderService.updateOrderStatus).toHaveBeenCalledWith(
      'ORD-001',
      'processing'
    )
  })
})

