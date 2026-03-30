import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.DATABASE_URL || ''

if (!MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to DATABASE_URL environment variable')
}

let client: MongoClient | null = null

export async function getMongoClient() {
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
    
    // Create new client
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('[MongoDB] Connected successfully')
    return client
  } catch (error) {
    console.error('[MongoDB] Connection error:', error)
    client = null
    throw error
  }
}

export function getDatabase() {
  if (!client) {
    throw new Error('MongoDB client not initialized')
  }
  return client.db('restaurant_pro')
}
