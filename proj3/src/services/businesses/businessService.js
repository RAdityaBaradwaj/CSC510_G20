// Business and Menu Service
// 3 Restaurants, 1 Supermarket, 1 Pharmacy

const businesses = [
  {
    id: 'BIZ-001',
    name: 'Pizza Palace',
    type: 'restaurant',
    category: 'Italian',
    description: 'Authentic Italian pizzas and pasta',
    image: '🍕',
    zipCodes: ['10001', '10002', '10003'],
    location: { lat: 40.7128, lng: -74.0060 },
    menu: [
      { id: 'PIZZA-001', name: 'Margherita Pizza', price: 18.99, description: 'Classic tomato, mozzarella, basil', category: 'Pizza' },
      { id: 'PIZZA-002', name: 'Pepperoni Pizza', price: 21.99, description: 'Pepperoni and mozzarella', category: 'Pizza' },
      { id: 'PIZZA-003', name: 'Veggie Supreme', price: 23.99, description: 'Mushrooms, peppers, onions, olives', category: 'Pizza' },
      { id: 'PASTA-001', name: 'Spaghetti Carbonara', price: 16.99, description: 'Creamy pasta with bacon', category: 'Pasta' },
      { id: 'PASTA-002', name: 'Fettuccine Alfredo', price: 15.99, description: 'Creamy alfredo sauce', category: 'Pasta' },
      { id: 'SALAD-001', name: 'Caesar Salad', price: 12.99, description: 'Fresh romaine with caesar dressing', category: 'Salads' },
      { id: 'DRINK-001', name: 'Coca Cola', price: 2.99, description: 'Soft drink', category: 'Beverages' },
      { id: 'DRINK-002', name: 'Water', price: 1.99, description: 'Bottled water', category: 'Beverages' }
    ]
  },
  {
    id: 'BIZ-002',
    name: 'Burger House',
    type: 'restaurant',
    category: 'American',
    description: 'Juicy burgers and fries',
    image: '🍔',
    zipCodes: ['10001', '10004'],
    location: { lat: 40.7589, lng: -73.9851 },
    menu: [
      { id: 'BURG-001', name: 'Classic Burger', price: 12.99, description: 'Beef patty, lettuce, tomato, onion', category: 'Burgers' },
      { id: 'BURG-002', name: 'Cheeseburger', price: 13.99, description: 'Classic burger with cheese', category: 'Burgers' },
      { id: 'BURG-003', name: 'Bacon Burger', price: 15.99, description: 'Burger with crispy bacon', category: 'Burgers' },
      { id: 'BURG-004', name: 'Veggie Burger', price: 11.99, description: 'Plant-based patty', category: 'Burgers' },
      { id: 'FRIES-001', name: 'French Fries', price: 4.99, description: 'Crispy golden fries', category: 'Sides' },
      { id: 'FRIES-002', name: 'Sweet Potato Fries', price: 5.99, description: 'Sweet potato fries', category: 'Sides' },
      { id: 'DRINK-003', name: 'Milkshake', price: 5.99, description: 'Vanilla, chocolate, or strawberry', category: 'Beverages' }
    ]
  },
  {
    id: 'BIZ-003',
    name: 'Sushi Express',
    type: 'restaurant',
    category: 'Japanese',
    description: 'Fresh sushi and Japanese cuisine',
    image: '🍣',
    zipCodes: ['10001', '10005'],
    location: { lat: 40.7505, lng: -73.9934 },
    menu: [
      { id: 'SUSHI-001', name: 'California Roll', price: 8.99, description: 'Crab, avocado, cucumber', category: 'Sushi Rolls' },
      { id: 'SUSHI-002', name: 'Salmon Roll', price: 9.99, description: 'Fresh salmon roll', category: 'Sushi Rolls' },
      { id: 'SUSHI-003', name: 'Dragon Roll', price: 12.99, description: 'Eel, cucumber, avocado', category: 'Sushi Rolls' },
      { id: 'SUSHI-004', name: 'Sashimi Platter', price: 24.99, description: 'Assorted fresh sashimi', category: 'Sashimi' },
      { id: 'RAMEN-001', name: 'Tonkotsu Ramen', price: 14.99, description: 'Pork bone broth ramen', category: 'Ramen' },
      { id: 'RAMEN-002', name: 'Miso Ramen', price: 13.99, description: 'Miso-based ramen', category: 'Ramen' },
      { id: 'DRINK-004', name: 'Green Tea', price: 2.99, description: 'Japanese green tea', category: 'Beverages' }
    ]
  },
  {
    id: 'BIZ-004',
    name: 'FreshMart Supermarket',
    type: 'supermarket',
    category: 'Grocery',
    description: 'Fresh groceries and everyday essentials',
    image: '🛒',
    zipCodes: ['10001', '10002', '10003', '10004', '10005'],
    location: { lat: 40.7282, lng: -73.7949 },
    menu: [
      { id: 'GROC-001', name: 'Milk (1 gallon)', price: 4.99, description: 'Whole milk', category: 'Dairy' },
      { id: 'GROC-002', name: 'Bread (loaf)', price: 3.99, description: 'White bread', category: 'Bakery' },
      { id: 'GROC-003', name: 'Eggs (dozen)', price: 5.99, description: 'Large eggs', category: 'Dairy' },
      { id: 'GROC-004', name: 'Bananas (lb)', price: 1.99, description: 'Fresh bananas', category: 'Produce' },
      { id: 'GROC-005', name: 'Chicken Breast (lb)', price: 7.99, description: 'Fresh chicken', category: 'Meat' },
      { id: 'GROC-006', name: 'Rice (5lb bag)', price: 8.99, description: 'Jasmine rice', category: 'Pantry' },
      { id: 'GROC-007', name: 'Pasta (1lb)', price: 2.99, description: 'Spaghetti pasta', category: 'Pantry' },
      { id: 'GROC-008', name: 'Tomatoes (lb)', price: 3.99, description: 'Fresh tomatoes', category: 'Produce' },
      { id: 'GROC-009', name: 'Butter (1lb)', price: 4.99, description: 'Unsalted butter', category: 'Dairy' },
      { id: 'GROC-010', name: 'Orange Juice (64oz)', price: 5.99, description: '100% orange juice', category: 'Beverages' }
    ]
  },
  {
    id: 'BIZ-005',
    name: 'HealthPlus Pharmacy',
    type: 'pharmacy',
    category: 'Healthcare',
    description: 'Prescription and over-the-counter medications',
    image: '💊',
    zipCodes: ['10001', '10002', '10003', '10004', '10005'],
    location: { lat: 40.7156, lng: -74.0087 },
    menu: [
      { id: 'PHARM-001', name: 'Aspirin (100 tablets)', price: 8.99, description: 'Pain reliever', category: 'Pain Relief' },
      { id: 'PHARM-002', name: 'Band-Aids (100 count)', price: 6.99, description: 'Adhesive bandages', category: 'First Aid' },
      { id: 'PHARM-003', name: 'Antibacterial Hand Sanitizer', price: 4.99, description: '8oz sanitizer', category: 'Hygiene' },
      { id: 'PHARM-004', name: 'Thermometer', price: 12.99, description: 'Digital thermometer', category: 'Health Monitoring' },
      { id: 'PHARM-005', name: 'Vitamin C (100 tablets)', price: 9.99, description: '1000mg vitamin C', category: 'Vitamins' },
      { id: 'PHARM-006', name: 'Cough Drops (25 count)', price: 3.99, description: 'Honey lemon cough drops', category: 'Cold & Flu' },
      { id: 'PHARM-007', name: 'Tissues (3-pack)', price: 5.99, description: 'Soft tissues', category: 'Health & Wellness' },
      { id: 'PHARM-008', name: 'First Aid Kit', price: 19.99, description: 'Complete first aid kit', category: 'First Aid' }
    ]
  }
]

export const businessService = {
  // Get all businesses
  getAllBusinesses: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return businesses
  },

  // Get business by ID
  getBusinessById: async (businessId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const business = businesses.find(b => b.id === businessId)
    if (!business) {
      throw new Error('Business not found')
    }
    return business
  },

  // Get businesses by type
  getBusinessesByType: async (type) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return businesses.filter(b => b.type === type)
  },

  // Get businesses by zip code
  getBusinessesByZipCode: async (zipCode) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return businesses.filter(b => b.zipCodes.includes(zipCode))
  },

  // Get menu items for a business
  getMenuItems: async (businessId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const business = businesses.find(b => b.id === businessId)
    if (!business) {
      throw new Error('Business not found')
    }
    return business.menu || []
  },

  // Get menu item by ID
  getMenuItemById: async (businessId, itemId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const business = businesses.find(b => b.id === businessId)
    if (!business) {
      throw new Error('Business not found')
    }
    const item = business.menu.find(m => m.id === itemId)
    if (!item) {
      throw new Error('Menu item not found')
    }
    return item
  }
}

export default businessService

