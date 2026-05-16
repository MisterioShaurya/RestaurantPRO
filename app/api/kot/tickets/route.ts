import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    
    if (!restaurantId) {
      return NextResponse.json({ kots: [] })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    
    // Tables page KOT Tickets panel: only active and preparing
    const kots = await db.collection('kots').find({
      restaurantId,
      status: { $in: ['active', 'preparing'] }
    }).sort({ createdAt: -1 }).toArray()

    // Normalize _id for client
    const normalized = (kots || []).map((k: any) => ({
      ...k,
      _id: k._id?.toString(),
      kotStatus: k.status || k.kotStatus || 'active',
      items: (k.items || []).map((item: any) => ({
        ...item,
        qty: item.quantity || item.qty || 1,
      }))
    }))

    return NextResponse.json({ kots: normalized })
  } catch (error) {
    console.error('[KOT Tickets] GET error:', error)
    return NextResponse.json({ kots: [] })
  }
}