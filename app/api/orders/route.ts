import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    
    if (!restaurantId) {
      return NextResponse.json({ orders: [] })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const orders = await db.collection('orders').find({ restaurantId }).toArray()
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('[Orders] GET error:', error)
    return NextResponse.json({ orders: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    
    if (!restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const order = await req.json()

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    
    if (!order.createdAt) {
      order.createdAt = new Date().toISOString()
    }
    
    const result = await db.collection('orders').insertOne({
      ...order,
      restaurantId,
    })

    return NextResponse.json({ order: { ...order, _id: result.insertedId } }, { status: 201 })
  } catch (error) {
    console.error('[Orders] POST error:', error)
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    
    if (!restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, id, status, kotStatus, kotId } = await req.json()
    const updateId = orderId || id || kotId

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    
    const setFields: Record<string, any> = { updatedAt: new Date().toISOString() }
    
    if (status) setFields.status = status
    if (kotStatus) {
      setFields.kotStatus = kotStatus
      setFields.isDone = kotStatus === 'done'
    }

    const result = await db.collection('orders').updateOne(
      { $or: [{ id: updateId }, { _id: updateId }], restaurantId },
      { $set: setFields }
    )

    if (result.matchedCount === 0) {
      // Try to update in local table orders as well
      return NextResponse.json({ message: 'Order not found in database, but status may still be synced locally' })
    }

    return NextResponse.json({ message: 'Order updated' })
  } catch (error) {
    console.error('[Orders] PUT error:', error)
    return NextResponse.json({ message: 'Failed to update order' }, { status: 500 })
  }
}
