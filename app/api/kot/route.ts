import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    
    // ALWAYS require restaurantId
    if (!restaurantId) {
      return NextResponse.json({ kots: [] })
    }
    
    // Get status filter from query params (default: all)
    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status')
    
    const query: any = { restaurantId }
    
    // If status filter provided (e.g. ?status=active,preparing)
    if (statusFilter) {
      const statuses = statusFilter.split(',').filter(Boolean)
      if (statuses.length > 0) {
        query.status = { $in: statuses }
      }
    }
    
    const kots = await db.collection('kots').find(query).sort({ createdAt: -1 }).limit(50).toArray()
    
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
    
    // Ensure consistent fields on every KOT document
    const now = new Date()
    const kotDoc = {
      ...kot,
      restaurantId: restaurantId || kot.restaurantId,
      createdAt: kot.createdAt || now.toISOString(),
      date: kot.date || now.toISOString().split('T')[0], // 'YYYY-MM-DD' for easy filtering
      status: kot.status || 'active',
      // Map legacy fields
      kotStatus: kot.kotStatus || kot.status || 'active',
      items: (kot.items || []).map((item: any) => ({
        ...item,
        qty: item.quantity || item.qty || 1,
      }))
    }
    
    const result = await db.collection('kots').insertOne(kotDoc)

    return NextResponse.json({ kot: { ...kotDoc, _id: result.insertedId } }, { status: 201 })
  } catch (error) {
    console.error('[KOT] POST error:', error)
    return NextResponse.json({ message: 'Failed to create KOT' }, { status: 500 })
  }
}
