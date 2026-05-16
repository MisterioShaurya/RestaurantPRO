/**
 * MongoDB Index Creation Script
 * Run: node scripts/create-indexes.js
 * 
 * Creates indexes for performance optimization on the kots collection
 * and other frequently queried collections.
 */

const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI

async function createIndexes() {
  if (!MONGODB_URI) {
    console.error('No MongoDB URI found. Set DATABASE_URL or MONGODB_URI in .env.local')
    process.exit(1)
  }

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db('restaurant_pos')

    // ====== kots Collection Indexes ======
    console.log('\n--- kots collection ---')
    
    // Compound index: restaurantId + status (used by Tables page KOT panel)
    await db.collection('kots').createIndex(
      { restaurantId: 1, status: 1 },
      { name: 'kots_restaurant_status', background: true }
    )
    console.log('  ✓ kots_restaurant_status index created')

    // Compound index: restaurantId + date + status (used by Chef KOT view)
    await db.collection('kots').createIndex(
      { restaurantId: 1, date: 1, status: 1 },
      { name: 'kots_restaurant_date_status', background: true }
    )
    console.log('  ✓ kots_restaurant_date_status index created')

    // Compound index: restaurantId + createdAt (used for sorting/list queries)
    await db.collection('kots').createIndex(
      { restaurantId: 1, createdAt: -1 },
      { name: 'kots_restaurant_createdAt', background: true }
    )
    console.log('  ✓ kots_restaurant_createdAt index created')

    // Single index: restaurantId (for general scoping)
    await db.collection('kots').createIndex(
      { restaurantId: 1 },
      { name: 'kots_restaurantId', background: true }
    )
    console.log('  ✓ kots_restaurantId index created')

    // ====== orders Collection Indexes ======
    console.log('\n--- orders collection ---')
    
    await db.collection('orders').createIndex(
      { restaurantId: 1, createdAt: -1 },
      { name: 'orders_restaurant_createdAt', background: true }
    )
    console.log('  ✓ orders_restaurant_createdAt index created')

    await db.collection('orders').createIndex(
      { restaurantId: 1, status: 1 },
      { name: 'orders_restaurant_status', background: true }
    )
    console.log('  ✓ orders_restaurant_status index created')

    // ====== collections Indexes ======
    console.log('\n--- menu collection ---')
    await db.collection('menu_items').createIndex(
      { restaurantId: 1, category: 1 },
      { name: 'menu_restaurant_category', background: true }
    )
    console.log('  ✓ menu_restaurant_category index created')

    console.log('\n--- tables collection ---')
    await db.collection('tables').createIndex(
      { restaurantId: 1 },
      { name: 'tables_restaurantId', background: true }
    )
    console.log('  ✓ tables_restaurantId index created')

    console.log('\n--- inventory collection ---')
    await db.collection('inventory').createIndex(
      { restaurantId: 1, name: 1 },
      { name: 'inventory_restaurant_name', background: true }
    )
    console.log('  ✓ inventory_restaurant_name index created')

    // ====== Update existing KOT documents ======
    // Add 'date' field to existing KOTs that don't have it
    console.log('\n--- Updating existing KOT documents ---')
    const updateResult = await db.collection('kots').updateMany(
      { date: { $exists: false }, createdAt: { $exists: true } },
      [{
        $set: {
          date: { $substr: ['$createdAt', 0, 10] }
        }
      }]
    )
    console.log(`  ✓ Updated ${updateResult.modifiedCount} KOTs with date field`)

    // Normalize status field on existing KOTs
    const normalizeResult = await db.collection('kots').updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    )
    console.log(`  ✓ Set default status on ${normalizeResult.modifiedCount} KOTs`)

    console.log('\n✅ All indexes created successfully!')
  } catch (error) {
    console.error('Error creating indexes:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

createIndexes()