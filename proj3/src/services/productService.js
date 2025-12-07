// Product service for managing product catalog
const mockProducts = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 79.99,
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'Electronics',
    image: '/images/headphones.jpg',
    stock: 50
  },
  {
    id: 2,
    name: 'Smartphone',
    price: 599.99,
    description: 'Latest model smartphone with advanced camera system',
    category: 'Electronics',
    image: '/images/smartphone.jpg',
    stock: 25
  },
  {
    id: 3,
    name: 'Laptop',
    price: 1299.99,
    description: 'High-performance laptop for work and gaming',
    category: 'Electronics',
    image: '/images/laptop.jpg',
    stock: 15
  },
  {
    id: 4,
    name: 'Coffee Maker',
    price: 89.99,
    description: 'Automatic coffee maker with programmable features',
    category: 'Appliances',
    image: '/images/coffee-maker.jpg',
    stock: 30
  },
  {
    id: 5,
    name: 'Running Shoes',
    price: 129.99,
    description: 'Comfortable running shoes for all terrains',
    category: 'Sports',
    image: '/images/shoes.jpg',
    stock: 40
  },
  {
    id: 6,
    name: 'Backpack',
    price: 49.99,
    description: 'Durable backpack for travel and daily use',
    category: 'Accessories',
    image: '/images/backpack.jpg',
    stock: 60
  }
]

export const productService = {
  // Get all products
  getProducts: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockProducts
  },

  // Get product by ID
  getProductById: async (productId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const product = mockProducts.find(p => p.id === parseInt(productId))
    if (!product) {
      throw new Error('Product not found')
    }
    return product
  },

  // Search products by name or description
  searchProducts: async (query) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const lowercaseQuery = query.toLowerCase()
    return mockProducts.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
    )
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockProducts.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    )
  },

  // Update product stock
  updateStock: async (productId, newStock) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const product = mockProducts.find(p => p.id === parseInt(productId))
    if (!product) {
      throw new Error('Product not found')
    }
    product.stock = newStock
    return product
  }
}
