import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.DATABASE_URL || ''

// Check if MongoDB URI is configured
const isMongoConfigured = MONGODB_URI && MONGODB_URI.length > 0

let client: MongoClient | null = null
let connectionFailed = false
let lastConnectionAttempt = 0
const RETRY_COOLDOWN = 60000 // 1 minute cooldown before retrying failed connections

export async function getMongoClient() {
  // If MongoDB is not configured, throw error immediately
  if (!isMongoConfigured) {
    throw new Error('MongoDB not configured')
  }

  // If connection recently failed, don't retry immediately
  if (connectionFailed && Date.now() - lastConnectionAttempt < RETRY_COOLDOWN) {
    throw new Error('MongoDB connection recently failed, using fallback')
  }

  try {
    // If client exists, check if it's still connected
    if (client) {
      try {
        // Try to ping the database to check if connection is alive
        await client.db('admin').command({ ping: 1 })
        return client
      } catch (error) {
        // Connection is closed or invalid, create a new one
        console.log('[MongoDB] Connection lost, reconnecting...')
        try {
          await client.close()
        } catch (closeError) {
          // Ignore close errors
        }
        client = null
      }
    }
    
    // Create new client with timeout options
    lastConnectionAttempt = Date.now()
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout for server selection
      connectTimeoutMS: 5000, // 5 second timeout for connection
      socketTimeoutMS: 5000, // 5 second timeout for socket operations
    })
    await client.connect()
    console.log('[MongoDB] Connected successfully')
    connectionFailed = false
    return client
  } catch (error) {
    console.error('[MongoDB] Connection error:', error)
    client = null
    connectionFailed = true
    throw error
  }
}

export function getDatabase() {
  if (!client) {
    throw new Error('MongoDB client not initialized')
  }
  return client.db('restaurant_pro')
}
