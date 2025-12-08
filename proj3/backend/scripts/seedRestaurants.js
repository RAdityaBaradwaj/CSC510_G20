/* Seed initial restaurants and menu items into Postgres */
const { randomUUID } = require('crypto')
const { Client } = require('pg')

const seedData = [
  {
    name: 'Oak City Pizza',
    type: 'restaurant',
    category: 'pizza',
    description: 'Downtown Raleigh pies with house-made dough and NC produce.',
    image: '🍕',
    address: '227 Fayetteville St, Raleigh, NC',
    zip_code: '27601',
    lat: 35.7772,
    lng: -78.6391,
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
    address: '18 Seaboard Ave, Raleigh, NC',
    zip_code: '27604',
    lat: 35.7895,
    lng: -78.6367,
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
    address: '400 Glenwood Ave, Raleigh, NC',
    zip_code: '27603',
    lat: 35.7843,
    lng: -78.6460,
    menu: [
      { name: 'Ibuprofen 200mg (50ct)', description: 'Pain reliever/fever reducer', price_cents: 899, category: 'medicine' },
      { name: 'Allergy Relief', description: 'Non-drowsy antihistamine 24hr', price_cents: 1299, category: 'medicine' },
      { name: 'Hand Sanitizer', description: '8oz gel with aloe', price_cents: 499, category: 'personal care' }
    ]
  }
]

async function main() {
  const databaseUrl = process.env.DATABASE_URL || loadEnvUrl()
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    // Always refresh seed data to keep demo consistent
    await client.query('DELETE FROM menu_items')
    await client.query('DELETE FROM restaurants')

    for (const restaurant of seedData) {
      const restaurantId = randomUUID()
      await client.query(
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
        await client.query(
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
    console.log('Seed complete.')
  } finally {
    await client.end()
  }
}

main().catch(err => {
  console.error('Seed failed', err)
  process.exit(1)
})

function loadEnvUrl() {
  try {
    const path = require('path')
    const fs = require('fs')
    const envPath = path.join(__dirname, '..', '..', '.env')
    const raw = fs.readFileSync(envPath, 'utf-8')
    const line = raw.split('\n').find(l => l.trim().startsWith('DATABASE_URL='))
    if (!line) throw new Error('DATABASE_URL not found in .env')
    return line.split('=')[1].trim()
  } catch {
    throw new Error('DATABASE_URL not set and not found in .env')
  }
}
