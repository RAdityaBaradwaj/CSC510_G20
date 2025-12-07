import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NearbyOrdersBoard from '../../src/components/nearbyOrdersBoard'

// Mock the services
vi.mock('../../src/services/locationService', () => ({
  locationService: {
    getCurrentLocation: vi.fn()
  }
}))

vi.mock('../../src/services/orderService', () => ({
  orderService: {
    getNearbyOrders: vi.fn(),
    updateOrderStatus: vi.fn()
  }
}))

vi.mock('../../src/hooks/useNearbyOrders', () => ({
  useNearbyOrders: vi.fn()
}))

describe('Nearby Orders Board', () => {
  test('renders location permission button when no location', () => {
    const mockUseNearbyOrders = vi.fn().mockReturnValue({
      nearbyOrders: [],
      loading: false,
      error: null,
      refetch: vi.fn()
    })

    vi.mocked(require('../../src/hooks/useNearbyOrders').useNearbyOrders).mockImplementation(mockUseNearbyOrders)

    render(
      <BrowserRouter>
        <NearbyOrdersBoard />
      </BrowserRouter>
    )

    expect(screen.getByText('Enable Location Access')).toBeInTheDocument()
  })

  test('shows loading state', () => {
    const mockUseNearbyOrders = vi.fn().mockReturnValue({
      nearbyOrders: [],
      loading: true,
      error: null,
      refetch: vi.fn()
    })

    vi.mocked(require('../../src/hooks/useNearbyOrders').useNearbyOrders).mockImplementation(mockUseNearbyOrders)

    render(
      <BrowserRouter>
        <NearbyOrdersBoard />
      </BrowserRouter>
    )

    expect(screen.getByText('Loading nearby orders...')).toBeInTheDocument()
  })

  test('displays nearby orders when available', () => {
    const mockOrders = [
      {
        id: 'ORD-001',
        customerName: 'John Doe',
        status: 'pending',
        total: 45.99,
        distance: 2.5
      }
    ]

    const mockUseNearbyOrders = vi.fn().mockReturnValue({
      nearbyOrders: mockOrders,
      loading: false,
      error: null,
      refetch: vi.fn()
    })

    vi.mocked(require('../../src/hooks/useNearbyOrders').useNearbyOrders).mockImplementation(mockUseNearbyOrders)

    render(
      <BrowserRouter>
        <NearbyOrdersBoard />
      </BrowserRouter>
    )

    expect(screen.getByText('Order #ORD-001')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
