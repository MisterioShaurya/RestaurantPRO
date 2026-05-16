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
    
    // Calculate today's date as YYYY-MM-DD string
    const now = new Date()
    const todayDateString = now.toISOString().split('T')[0] // 'YYYY-MM-DD'
    
    // Also get start/end of day timestamps for createdAt fallback
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    // Query: scoped to restaurantId, today's date, active or cancelled status
    const kots = await db.collection('kots').find({
      restaurantId,
      $or: [
        { date: todayDateString },
        { 
          createdAt: { 
            $gte: startOfDay.toISOString(),
            $lte: endOfDay.toISOString()
          }
        }
      ],
      status: { $in: ['active', 'preparing', 'cancelled'] }
    }).sort({ createdAt: -1 }).toArray()

    // Normalize _id for client
    const normalized = (kots || []).map((k: any) => ({
      ...k,
      _id: k._id?.toString(),
      kotStatus: k.status || k.kotStatus || 'active',
      // Ensure items have consistent format
      items: (k.items || []).map((item: any) => ({
        ...item,
        qty: item.quantity || item.qty || 1,
      }))
    }))

    return NextResponse.json({ kots: normalized })
  } catch (error) {
    console.error('[Chef KOT] GET error:', error)
    return NextResponse.json({ kots: [] })
  }
}