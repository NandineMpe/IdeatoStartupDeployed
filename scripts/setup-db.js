const { Client } = require('pg')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables from .env.local if present
const envPath = path.resolve(__dirname, '../.env.local')
dotenv.config({ path: envPath })

const connectionString = process.env.SUPABASE_DB_URL

if (!connectionString) {
  console.error('SUPABASE_DB_URL not set in environment')
  process.exit(1)
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

async function setup() {
  try {
    await client.connect()
    await client.query(`
      create table if not exists user_interactions (
        id uuid primary key default gen_random_uuid(),
        user_id uuid references users(id) on delete cascade,
        feature text not null,
        input jsonb,
        output jsonb,
        created_at timestamptz default now()
      )
    `)
    console.log('✅ user_interactions table is ready')
  } catch (err) {
    console.error('Error setting up database:', err)
  } finally {
    await client.end()
  }
}

setup()
