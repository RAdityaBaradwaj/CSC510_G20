/* Run all SQL migrations in backend/migrations against DATABASE_URL */
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function main() {
  const migrationsDir = path.join(__dirname, '..', 'migrations')
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

  if (files.length === 0) {
    console.log('No migrations found.')
    return
  }

  const databaseUrl = process.env.DATABASE_URL || loadEnvUrl()

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
      console.log(`Running migration: ${file}`)
      await client.query(sql)
    }
    console.log('Migrations complete.')
  } finally {
    await client.end()
  }
}

main().catch(err => {
  console.error('Migration failed', err)
  process.exit(1)
})

function loadEnvUrl() {
  try {
    const envPath = path.join(__dirname, '..', '..', '.env')
    const raw = fs.readFileSync(envPath, 'utf-8')
    const line = raw.split('\n').find(l => l.trim().startsWith('DATABASE_URL='))
    if (!line) throw new Error('DATABASE_URL not found in .env')
    return line.split('=')[1].trim()
  } catch {
    throw new Error('DATABASE_URL not set and not found in .env')
  }
}
