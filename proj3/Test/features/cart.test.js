import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CartPage from '../../src/pages/CartPage'

describe('Cart Page', () => {
  test('renders cart items', () => {
    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
    expect(screen.getByText('Sample Product 1')).toBeInTheDocument()
    expect(screen.getByText('Sample Product 2')).toBeInTheDocument()
  })

  test('calculates total correctly', () => {
    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    )

    // Sample Product 1: $29.99 x 2 = $59.98
    // Sample Product 2: $19.99 x 1 = $19.99
    // Total: $79.97
    expect(screen.getByText('Total: $79.97')).toBeInTheDocument()
  })

  test('shows checkout button', () => {
    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument()
  })
})
