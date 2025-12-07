import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OrderCard from '../../src/components/OrderCard'

const mockOrder = {
  id: 'ORD-001',
  customerName: 'John Doe',
  status: 'pending',
  total: 50.00,
  items: [
    { productName: 'Pizza', quantity: 1, price: 25.00 },
    { productName: 'Salad', quantity: 1, price: 25.00 }
  ],
  createdAt: new Date().toISOString(),
  deliveryAddress: '123 Main St, New York, NY',
  notes: 'Test notes',
  distance: 2.5,
  deliveryLocation: { lat: 40.7128, lng: -74.0060 }
}

describe('OrderCard', () => {
  const mockOnStatusUpdate = vi.fn()

  const renderOrderCard = (order = mockOrder) => {
    return render(
      <OrderCard 
        order={order}
        userLocation={{ lat: 40.7128, lng: -74.0060 }}
        onStatusUpdate={mockOnStatusUpdate}
      />
    )
  }

  test('should render order information', () => {
    renderOrderCard()
    
    expect(screen.getByText('Order #ORD-001')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('$50.00')).toBeInTheDocument()
  })

  test('should display order items', () => {
    renderOrderCard()
    expect(screen.getByText(/2 item\(s\)/)).toBeInTheDocument()
  })

  test('should display delivery address', () => {
    renderOrderCard()
    expect(screen.getByText(/123 Main St/)).toBeInTheDocument()
  })

  test('should display distance when available', () => {
    renderOrderCard()
    expect(screen.getByText(/2.50km/)).toBeInTheDocument()
  })

  test('should display notes when available', () => {
    renderOrderCard()
    expect(screen.getByText('Test notes')).toBeInTheDocument()
  })

  test('should call onStatusUpdate when status changes', () => {
    renderOrderCard()
    
    const select = screen.getByLabelText(/Update Status/)
    fireEvent.change(select, { target: { value: 'processing' } })
    
    expect(mockOnStatusUpdate).toHaveBeenCalledWith('ORD-001', 'processing')
  })

  test('should render status styles correctly', () => {
    renderOrderCard()
    
    const statusBadge = screen.getByText('Pending')
    expect(statusBadge).toHaveClass('status-pending')
  })

  test('should format distance correctly for short distances', () => {
    const nearOrder = { ...mockOrder, distance: 0.5 }
    renderOrderCard(nearOrder)
    
    expect(screen.getByText(/500m/)).toBeInTheDocument()
  })

  test('should handle missing optional fields', () => {
    const minimalOrder = {
      id: 'ORD-002',
      customerName: 'Jane Doe',
      status: 'ready',
      total: 30.00,
      items: [{ productName: 'Test', quantity: 1, price: 30.00 }],
      createdAt: new Date().toISOString(),
      deliveryAddress: 'Test Address',
      deliveryLocation: { lat: 40.7128, lng: -74.0060 }
    }
    
    renderOrderCard(minimalOrder)
    
    expect(screen.getByText('Order #ORD-002')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })
})

