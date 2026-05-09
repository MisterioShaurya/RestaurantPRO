import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    if (!restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const updates = await req.json()
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const result = await db.collection('staff').updateOne(
      { _id: new ObjectId(params.id), restaurantId },
      { $set: { ...updates, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Staff member updated' })
  } catch (error) {
    console.error('Update staff error:', error)
    return NextResponse.json({ message: 'Failed to update staff member' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    if (!restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const result = await db.collection('staff').deleteOne(
      { _id: new ObjectId(params.id), restaurantId }
    )

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Staff member deleted' })
  } catch (error) {
    console.error('Delete staff error:', error)
    return NextResponse.json({ message: 'Failed to delete staff member' }, { status: 500 })
  }
}