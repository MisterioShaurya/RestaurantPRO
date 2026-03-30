#!/usr/bin/env node

/**
 * Restaurant POS - Database Initialization Script
 * Creates all required collections, indexes, and default data
 */

const { MongoClient } = require('mongodb')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.DATABASE_URL
const DB_NAME = 'restaurant_pos'

if (!MONGODB_URI) {
  console.error('❌ DATABASE_URL not found in .env.local')
  process.exit(1)
}

async function initializeDatabase() {
  let client

  try {
    console.log('🔄 Connecting to MongoDB...')
    client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db(DB_NAME)
    console.log(`✅ Connected to database: ${DB_NAME}`)

    // Create collections and indexes
    await createCollections(db)
    await createIndexes(db)
    await createDefaultData(db)

    console.log('🎉 Database initialization completed successfully!')
    console.log('\n📋 Default Admin Account:')
    console.log('   Email: admin@restaurant.local')
    console.log('   Password: admin123')
    console.log('\n🔑 Secret Unlock Code: RENEW123')

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('🔌 Database connection closed')
    }
  }
}

async function createCollections(db) {
  console.log('\n📁 Creating collections...')

  const collections = [
    'users',
    'subscriptions',
    'tables',
    'menu',
    'orders',
    'reservations',
    'inventory',
    'analytics'
  ]

  for (const collectionName of collections) {
    try {
      await db.createCollection(collectionName)
      console.log(`   ✅ Created collection: ${collectionName}`)
    } catch (error) {
      if (error.code === 48) {
        console.log(`   ⚠️  Collection already exists: ${collectionName}`)
      } else {
        throw error
      }
    }
  }
}

async function createIndexes(db) {
  console.log('\n🔍 Creating indexes...')

  // Users collection indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('users').createIndex({ username: 1 }, { unique: true })
  console.log('   ✅ Users indexes created')

  // Subscriptions collection indexes
  await db.collection('subscriptions').createIndex({ business_id: 1 })
  await db.collection('subscriptions').createIndex({ user_name: 1 })
  await db.collection('subscriptions').createIndex({ status: 1 })
  await db.collection('subscriptions').createIndex({ subscription_expiry_date: 1 })
  console.log('   ✅ Subscriptions indexes created')

  // Tables collection indexes
  await db.collection('tables').createIndex({ number: 1 }, { unique: true })
  await db.collection('tables').createIndex({ status: 1 })
  console.log('   ✅ Tables indexes created')

  // Menu collection indexes
  await db.collection('menu').createIndex({ userId: 1 })
  await db.collection('menu').createIndex({ category: 1 })
  await db.collection('menu').createIndex({ available: 1 })
  console.log('   ✅ Menu indexes created')

  // Orders collection indexes
  await db.collection('orders').createIndex({ userId: 1 })
  await db.collection('orders').createIndex({ tableId: 1 })
  await db.collection('orders').createIndex({ createdAt: -1 })
  await db.collection('orders').createIndex({ status: 1 })
  console.log('   ✅ Orders indexes created')

  // Reservations collection indexes
  await db.collection('reservations').createIndex({ userId: 1 })
  await db.collection('reservations').createIndex({ reservationTime: 1 })
  await db.collection('reservations').createIndex({ status: 1 })
  console.log('   ✅ Reservations indexes created')
}

async function createDefaultData(db) {
  console.log('\n📝 Creating default data...')

  // Create default admin user
  const bcrypt = require('bcryptjs')
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const adminUser = {
    username: 'admin',
    email: 'admin@restaurant.local',
    password: hashedPassword,
    name: 'Restaurant Admin',
    role: 'admin',
    restaurantName: 'My Restaurant',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // Check if admin already exists
  const existingAdmin = await db.collection('users').findOne({ email: 'admin@restaurant.local' })
  if (!existingAdmin) {
    const result = await db.collection('users').insertOne(adminUser)
    console.log('   ✅ Default admin user created')

    // Create default subscription for admin
    const subscription = {
      business_id: result.insertedId.toString(),
      user_name: 'admin',
      subscription_type: 'MONTHLY',
      subscription_start_date: new Date(),
      subscription_expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      grace_period_days: 5,
      status: 'ACTIVE',
      last_payment_date: new Date(),
      last_login_time: new Date(),
      is_unlocked_by_code: false,
      temporary_unlock_expiry: null,
      created_at: new Date(),
      updated_at: new Date()
    }

    await db.collection('subscriptions').insertOne(subscription)
    console.log('   ✅ Default subscription created')
  } else {
    console.log('   ⚠️  Admin user already exists')
  }

  // Create default tables
  const existingTables = await db.collection('tables').countDocuments()
  if (existingTables === 0) {
    const defaultTables = []
    for (let i = 1; i <= 12; i++) {
      defaultTables.push({
        number: i,
        capacity: 4,
        status: 'available',
        tableName: `Table ${i}`,
        userId: adminUser._id || existingAdmin._id,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    await db.collection('tables').insertMany(defaultTables)
    console.log('   ✅ Default tables created')
  } else {
    console.log('   ⚠️  Tables already exist')
  }

  // Create default menu items
  const existingMenu = await db.collection('menu').countDocuments()
  if (existingMenu === 0) {
    const defaultMenuItems = [
      // Appetizers
      { name: 'Samosa', price: 80, category: 'Appetizers', description: 'Crispy potato samosa', available: true, userId: adminUser._id || existingAdmin._id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Paneer Tikka', price: 150, category: 'Appetizers', description: 'Grilled paneer pieces', available: true, userId: adminUser._id || existingAdmin._id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Spring Roll', price: 120, category: 'Appetizers', available: true, userId: adminUser._id || existingAdmin._id, createdAt: new Date(), updatedAt: new Date() },

      // Main Course
      { name: 'Butter Chicken', price: 280, category: 'Main Course', description: 'Tender chicken in cream sauce', available: true, userId: adminUser._id || existingAdmin._id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Paneer Butter Masala', price: 250, category: 'Main Course', available: true, userId: adminUser._id || existingAdmin._id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Biryani', price: 220, category: 'Main Course', available: true, userId: adminUser._id || existingAdmin._id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Dal Makhani', price: 180, category: 'Main Course', available: true, userId: adminUser._id || existingAdmin._id, createdAt: new Date(), updatedAt: new Date() },

      // Breads
      { name: 'Naan', price: 50, category: 'Breads', available: true, userId: adminUser._id || existingAdmin._id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Roti', price: 30, category: 'Breads', available: true, userId: adminUser._id || existingAdmin._id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Garlic Naan', price: 70, category: 'Breads', available: true, userId: adminUser._id || existingAdmin._id, createdAt: new Date(), updatedAt: new Date() },

      // Beverages
      { name: 'Lassi', price: 60, category: 'Beverages', available: true, userId: adminUser._id || existingAdmin._id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Chai', price: 40, category: 'Beverages', available: true, userId: adminUser._id || existingAdmin._id, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Coca Cola', price: 50, category: 'Beverages', available: true, userId: adminUser._id || existingAdmin._id, createdAt: new Date(), updatedAt: new Date() },
    ]

    await db.collection('menu').insertMany(defaultMenuItems)
    console.log('   ✅ Default menu items created')
  } else {
    console.log('   ⚠️  Menu items already exist')
  }
}

// Run the initialization
initializeDatabase().catch(console.error)
