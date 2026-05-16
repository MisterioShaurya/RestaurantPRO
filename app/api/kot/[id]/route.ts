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

    const updateFields: Record<string, any> = { 
      updatedAt: new Date().toISOString() 
    }

    if (kotStatus) {
      updateFields.kotStatus = kotStatus
      updateFields.isDone = kotStatus === 'done'
    } else if (status) {
      updateFields.status = status
      // Derive kotStatus from status for backward compatibility
      if (status === 'ready' || status === 'completed') {
        updateFields.kotStatus = 'done'
        updateFields.isDone = true
      } else if (status === 'preparing') {
        updateFields.kotStatus = 'preparing'
      } else if (status === 'cancelled') {
        updateFields.kotStatus = 'cancelled'
      }
    }

    const id = params.id
    let result: any = null

    // Try ObjectId format
    try {
      result = await db.collection('kots').updateOne(
        { _id: new ObjectId(id), restaurantId },
        { $set: updateFields }
      )
    } catch {
      // ignore
    }

    if (!result || result.matchedCount === 0) {
      result = await db.collection('kots').updateOne(
        { id, restaurantId },
        { $set: updateFields }
      )
    }

    // Also update the orders collection with matching kot id or kotId field
    try {
      await db.collection('orders').updateMany(
        { $or: [{ id }, { _id: id }, { kotId: id }], restaurantId },
        { $set: updateFields }
      )
    } catch {
      // ignore
    }

    return NextResponse.json({ 
      success: true,
      updated: result ? result.modifiedCount > 0 : false,
      matched: result ? result.matchedCount : 0
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