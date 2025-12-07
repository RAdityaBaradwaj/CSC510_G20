import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NearbyOrdersBoard from '../../src/components/nearbyOrdersBoard'

// Mock dependencies
vi.mock('../../src/services/orders/orderService')
vi.mock('../../src/services/locationService')
vi.mock('../../src/hooks/useNearbyOrders')
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position }) => <div data-testid={`marker-${position[0]}`} />,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>
}))

describe('NearbyOrdersBoard', () => {
  const mockUseNearbyOrders = {
    nearbyOrders: [],
    loading: false,
    error: null,
    refetch: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock useNearbyOrders hook
    vi.mocked(require('../../src/hooks/useNearbyOrders').useNearbyOrders).mockReturnValue(mockUseNearbyOrders)
  })

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <NearbyOrdersBoard />
      </BrowserRouter>
    )
  }

  test('should render location controls', () => {
    renderComponent()
    expect(screen.getByText('Location & Filters')).toBeInTheDocument()
  })

  test('should show loading state', () => {
    const useNearbyOrders = require('../../src/hooks/useNearbyOrders')
    useNearbyOrders.useNearbyOrders.mockReturnValue({
      ...mockUseNearbyOrders,
      loading: true
    })

    renderComponent()
    expect(screen.getByText('Loading nearby orders...')).toBeInTheDocument()
  })

  test('should show error message', () => {
    const useNearbyOrders = require('../../src/hooks/useNearbyOrders')
    useNearbyOrders.useNearbyOrders.mockReturnValue({
      ...mockUseNearbyOrders,
      error: 'Test error'
    })

    renderComponent()
    expect(screen.getByText(/Error loading nearby orders/)).toBeInTheDocument()
  })

  test('should display "No orders found" when empty', () => {
    renderComponent()
    expect(screen.getByText(/No nearby orders found/)).toBeInTheDocument()
  })

  test('should display orders when available', () => {
    const useNearbyOrders = require('../../src/hooks/useNearbyOrders')
    useNearbyOrders.useNearbyOrders.mockReturnValue({
      ...mockUseNearbyOrders,
      nearbyOrders: [
        {
          id: 'ORD-001',
          customerName: 'John Doe',
          status: 'pending',
          total: 50.00,
          location: { lat: 40.7128, lng: -74.0060 }
        }
      ]
    })

    renderComponent()
    expect(screen.getByText('Order #ORD-001')).toBeInTheDocument()
  })

  test('should handle zip code input', async () => {
    const locationService = require('../../src/services/locationService')
    locationService.locationService.getCoordinatesFromZip.mockResolvedValue({
      lat: 40.7128,
      lng: -74.0060
    })

    renderComponent()
    
    const zipInput = screen.getByPlaceholderText(/Enter zip code/)
    expect(zipInput).toBeInTheDocument()
  })
})

