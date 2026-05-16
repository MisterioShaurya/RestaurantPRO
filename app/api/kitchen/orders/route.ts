import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    // Get today's date range for filtering
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const query: any = {
      createdAt: { 
        $gte: startOfDay.toISOString(),
        $lte: endOfDay.toISOString()
      }
    }

    // If restaurantId exists, scope by it
    if (restaurantId) {
      query.restaurantId = restaurantId
    }

    // Fetch today's non-completed orders
    const orders = await db
      .collection('orders')
      .find(query)
      .sort({ createdAt: 1 })
      .limit(1000)
      .toArray()

    // Normalize _id and createdAt for client-side use
    const normalized = (orders || []).map((o: any) => ({
      ...o,
      _id: o._id?.toString(),
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,
    }))

    return NextResponse.json({ orders: normalized })
  } catch (error) {
    console.error('Kitchen orders error:', error)
    return NextResponse.json({ orders: [] })
  }
}