import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    if (!restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { status, kotStatus } = await req.json()
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    // Determine the final status value
    const finalStatus = kotStatus || status || 'active'
    
    // Map legacy statuses to proper enum values
    const mappedStatus = (() => {
      switch (finalStatus) {
        case 'pending':
        case 'active':
          return 'active'
        case 'preparing':
          return 'preparing'
        case 'done':
        case 'completed':
        case 'ready':
          return 'done'
        case 'cancelled':
          return 'cancelled'
        default:
          return finalStatus
      }
    })()

    const updateFields: Record<string, any> = { 
      status: mappedStatus,
      updatedAt: new Date().toISOString()
    }

    const id = params.id
    let result: any = null

    // Try ObjectId format - update ONE document only
    try {
      result = await db.collection('kots').findOneAndUpdate(
        { _id: new ObjectId(id), restaurantId },
        { $set: updateFields },
        { returnDocument: 'after' }
      )
    } catch {
      // ignore
    }

    if (!result) {
      // Fallback: try matching by string id field
      result = await db.collection('kots').findOneAndUpdate(
        { id, restaurantId },
        { $set: updateFields },
        { returnDocument: 'after' }
      )
    }

    return NextResponse.json({ 
      success: true,
      updated: !!result,
      kot: result ? { ...result, _id: result._id?.toString() } : null
    })
  } catch (error) {
    console.error('[KOT PATCH] Error:', error)
    return NextResponse.json({ message: 'Failed to update KOT' }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    if (!restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const id = params.id

    let kot: any = null

    try {
      kot = await db.collection('kots').findOne({ _id: new ObjectId(id), restaurantId })
    } catch {
      kot = await db.collection('kots').findOne({ id, restaurantId })
    }

    if (!kot) {
      // Try orders collection
      try {
        kot = await db.collection('orders').findOne({ _id: new ObjectId(id), restaurantId })
      } catch {
        kot = await db.collection('orders').findOne({ id, restaurantId })
      }
    }

    return NextResponse.json({ kot })
  } catch (error) {
    console.error('[KOT GET] Error:', error)
    return NextResponse.json({ kot: null })
  }
}