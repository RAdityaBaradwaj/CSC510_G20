// Mock order data - Replace with real API when ready

export const orders = [
  {
    id: 'ORD-001',
    customerId: 'CUST-001',
    customerName: 'John Doe',
    businessId: 'BIZ-001',
    businessName: 'Sam\'s Grocery',
    status: 'pending',
    location: {
      zipCode: '10001',
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Main St, New York, NY 10001'
    },
    items: [
      { id: '1', productName: 'Large Pepperoni Pizza', quantity: 1, price: 24.99, subtotal: 24.99 },
      { id: '2', productName: 'Caesar Salad', quantity: 1, price: 8.50, subtotal: 8.50 }
    ],
    total: 33.49,
    notes: 'Please deliver after 5 PM',
    createdAt: new Date('2024-01-15T17:45:00').toISOString(),
    updatedAt: new Date('2024-01-15T17:45:00').toISOString(),
    metadata: {}
  },
  {
    id: 'ORD-002',
    customerId: 'CUST-002',
    customerName: 'Sarah M. Johnson',
    businessId: 'BIZ-001',
    businessName: 'Sam\'s Grocery',
    driverId: 'DRV-001',
    status: 'ready',
    location: {
      zipCode: '10001',
      lat: 40.7589,
      lng: -73.9851,
      address: '456 Oak Ave, New York, NY 10001'
    },
    items: [
      { id: '3', productName: 'Chicken Sandwich', quantity: 1, price: 12.99, subtotal: 12.99 },
      { id: '4', productName: 'Fries', quantity: 1, price: 4.50, subtotal: 4.50 },
      { id: '5', productName: 'Soda', quantity: 1, price: 2.99, subtotal: 2.99 }
    ],
    total: 20.48,
    notes: 'Fragile - handle with care',
    createdAt: new Date('2024-01-15T17:30:00').toISOString(),
    updatedAt: new Date('2024-01-15T18:00:00').toISOString(),
    metadata: {}
  },
  {
    id: 'ORD-003',
    customerId: 'CUST-003',
    customerName: 'Bob Smith',
    businessId: 'BIZ-001',
    businessName: 'Sam\'s Grocery',
    status: 'processing',
    location: {
      zipCode: '10001',
      lat: 40.7505,
      lng: -73.9934,
      address: '789 Pine St, New York, NY 10001'
    },
    items: [
      { id: '6', productName: 'Headphones', quantity: 1, price: 25.00, subtotal: 25.00 }
    ],
    total: 25.00,
    notes: 'Customer prefers morning delivery',
    createdAt: new Date('2024-01-15T16:20:00').toISOString(),
    updatedAt: new Date('2024-01-15T17:15:00').toISOString(),
    metadata: {}
  },
  {
    id: 'ORD-004',
    customerId: 'CUST-004',
    customerName: 'Alice Brown',
    businessId: 'BIZ-001',
    businessName: 'Sam\'s Grocery',
    driverId: 'DRV-002',
    status: 'delivered',
    location: {
      zipCode: '10001',
      lat: 40.7282,
      lng: -73.7949,
      address: '321 Elm St, New York, NY 10001'
    },
    items: [
      { id: '7', productName: 'Tablet', quantity: 1, price: 120.75, subtotal: 120.75 }
    ],
    total: 120.75,
    notes: 'Delivered successfully',
    createdAt: new Date('2024-01-14T14:20:00').toISOString(),
    updatedAt: new Date('2024-01-14T16:30:00').toISOString(),
    metadata: {}
  }
]
