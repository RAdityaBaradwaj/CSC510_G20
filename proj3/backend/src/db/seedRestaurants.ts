import { randomUUID } from 'crypto'
import { query } from './pool'

const seedData = [
  {
    name: 'Oak City Pizza',
    type: 'restaurant',
    category: 'pizza',
    description: 'Downtown Raleigh pies with house-made dough and NC produce.',
    image: '🍕',
    address: '237 S Wilmington St, Raleigh, NC 27601',
    zip_code: '27601',
    lat: 35.7765,
    lng: -78.6377,
    menu: [
      { name: 'Margherita Pie', description: 'Fresh mozzarella, basil, tomato sauce', price_cents: 1599, category: 'pizza' },
      { name: 'Carolina Pepperoni', description: 'Local pepperoni and mozzarella', price_cents: 1699, category: 'pizza' },
      { name: 'Garlic Knots', description: 'House-made knots with garlic herb butter', price_cents: 799, category: 'sides' }
    ]
  },
  {
    name: 'Seaboard Market',
    type: 'supermarket',
    category: 'grocery',
    description: 'Neighborhood grocer for fresh produce and pantry staples.',
    image: '🛒',
    address: '14 W Peace St, Raleigh, NC 27604',
    zip_code: '27604',
    lat: 35.7904,
    lng: -78.6398,
    menu: [
      { name: 'Organic Avocados (2 pack)', description: 'Hass avocados, ripe to eat', price_cents: 499, category: 'produce' },
      { name: 'Fresh Sourdough', description: 'Locally baked sourdough loaf', price_cents: 699, category: 'bakery' },
      { name: 'Cold Brew Concentrate', description: '32oz house cold brew', price_cents: 1199, category: 'beverages' }
    ]
  },
  {
    name: 'Capital Pharmacy',
    type: 'pharmacy',
    category: 'pharmacy',
    description: 'Raleigh pharmacy with everyday essentials and OTC meds.',
    image: '💊',
    address: '615 W Morgan St, Raleigh, NC 27603',
    zip_code: '27603',
    lat: 35.7799,
    lng: -78.6501,
    menu: [
      { name: 'Ibuprofen 200mg (50ct)', description: 'Pain reliever/fever reducer', price_cents: 899, category: 'medicine' },
      { name: 'Allergy Relief', description: 'Non-drowsy antihistamine 24hr', price_cents: 1299, category: 'medicine' },
      { name: 'Hand Sanitizer', description: '8oz gel with aloe', price_cents: 499, category: 'personal care' }
    ]
  }
]

export async function seedRestaurants() {
  // Always refresh seed data to keep demo consistent
  await query('DELETE FROM menu_items')
  await query('DELETE FROM restaurants')

  for (const restaurant of seedData) {
    const restaurantId = randomUUID()
    await query(
      `INSERT INTO restaurants (id, name, type, category, description, image, address, zip_code, lat, lng)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        restaurantId,
        restaurant.name,
        restaurant.type,
        restaurant.category,
        restaurant.description || '',
        restaurant.image || '',
        restaurant.address || '',
        restaurant.zip_code || '',
        restaurant.lat || null,
        restaurant.lng || null
      ]
    )

    for (const item of restaurant.menu) {
      await query(
        `INSERT INTO menu_items (id, restaurant_id, name, description, price_cents, category)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          randomUUID(),
          restaurantId,
          item.name,
          item.description || '',
          item.price_cents,
          item.category || ''
        ]
      )
    }
  }
}
