import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    if (!restaurantId) {
      return NextResponse.json({ config: null })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const config = await db.collection('expense_config').findOne({ restaurantId })

    return NextResponse.json({ config: config || { investment: 0, capital: 0 } })
  } catch (error) {
    console.error('Fetch expense config error:', error)
    return NextResponse.json({ config: { investment: 0, capital: 0 } })
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

    const existing = await db.collection('expense_config').findOne({ restaurantId })

    if (existing) {
      await db.collection('expense_config').updateOne(
        { restaurantId },
        { $set: { ...data, updatedAt: new Date() } }
      )
    } else {
      await db.collection('expense_config').insertOne({
        restaurantId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ success: true, message: 'Config updated' })
  } catch (error) {
    console.error('Update expense config error:', error)
    return NextResponse.json({ message: 'Failed to update config' }, { status: 500 })
  }
}