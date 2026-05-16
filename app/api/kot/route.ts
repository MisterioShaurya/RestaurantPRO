import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    
    const query: any = {}
    if (restaurantId) {
      query.restaurantId = restaurantId
    }
    
    const kots = await db.collection('kots').find(query).sort({ createdAt: -1 }).limit(500).toArray()
    
    // Normalize _id for client
    const normalized = (kots || []).map((k: any) => ({
      ...k,
      _id: k._id?.toString(),
    }))
    
    return NextResponse.json({ kots: normalized })
  } catch (error) {
    console.error('[KOT] GET error:', error)
    return NextResponse.json({ kots: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    const kot = await req.json()

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    
    if (!kot.createdAt) {
      kot.createdAt = new Date().toISOString()
    }
    
    // Scope to restaurant
    if (restaurantId) {
      kot.restaurantId = restaurantId
    }
    
    const result = await db.collection('kots').insertOne(kot)

    return NextResponse.json({ kot: { ...kot, _id: result.insertedId } }, { status: 201 })
  } catch (error) {
    console.error('[KOT] POST error:', error)
    return NextResponse.json({ message: 'Failed to create KOT' }, { status: 500 })
  }
}
