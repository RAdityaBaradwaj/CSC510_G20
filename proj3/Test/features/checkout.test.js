import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProductsPage from '../../src/pages/ProductsPage'

// Mock the product service
vi.mock('../../src/services/productService', () => ({
  productService: {
    getProducts: vi.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Test Product',
        price: 29.99,
        description: 'A test product',
        category: 'Electronics'
      }
    ])
  }
}))

describe('Products Page', () => {
  test('renders products list', async () => {
    render(
      <BrowserRouter>
        <ProductsPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Products')).toBeInTheDocument()
    
    // Wait for products to load
    await screen.findByText('Test Product')
    expect(screen.getByText('$29.99')).toBeInTheDocument()
  })

  test('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <ProductsPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Loading products...')).toBeInTheDocument()
  })
})