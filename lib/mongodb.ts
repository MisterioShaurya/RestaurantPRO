import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.DATABASE_URL || ''

if (!MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to DATABASE_URL environment variable')
}

let client: MongoClient | null = null

export async function getMongoClient() {
  if (!client) {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
  }
  return client
}

export function getDatabase() {
  if (!client) {
    throw new Error('MongoDB client not initialized')
  }
  return client.db('restaurant_pro')
}
