import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    if (!restaurantId) {
      return NextResponse.json({ items: [] })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const items = await db.collection('inventory').find({ restaurantId }).toArray()

    return NextResponse.json({ items: items || [] })
  } catch (error) {
    console.error('[Inventory] GET error:', error)
    return NextResponse.json({ items: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    if (!restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const newItem = {
      name: data.name,
      quantity: Number(data.quantity) || 0,
      unit: data.unit || 'kg',
      minStock: Number(data.minStock) || 0,
      cost: Number(data.cost) || 0,
      category: data.category || '',
      restaurantId,
      createdAt: new Date(),
    }

    const result = await db.collection('inventory').insertOne(newItem)

    return NextResponse.json({ item: { _id: result.insertedId, ...newItem } }, { status: 201 })
  } catch (error) {
    console.error('[Inventory] POST error:', error)
    return NextResponse.json({ message: 'Failed to add item' }, { status: 500 })
  }
}