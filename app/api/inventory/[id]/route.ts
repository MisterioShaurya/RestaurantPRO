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

    const { quantity, ...otherUpdates } = await req.json()
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const updateData: any = { updatedAt: new Date() }
    if (quantity !== undefined) updateData.quantity = Number(quantity)
    if (otherUpdates.name) updateData.name = otherUpdates.name
    if (otherUpdates.unit) updateData.unit = otherUpdates.unit
    if (otherUpdates.minStock !== undefined) updateData.minStock = Number(otherUpdates.minStock)
    if (otherUpdates.cost !== undefined) updateData.cost = Number(otherUpdates.cost)
    if (otherUpdates.category) updateData.category = otherUpdates.category

    const result = await db.collection('inventory').updateOne(
      { _id: new ObjectId(params.id), restaurantId },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ updated: true })
  } catch (error) {
    console.error('Update inventory error:', error)
    return NextResponse.json({ message: 'Failed to update inventory' }, { status: 500 })
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

    const result = await db.collection('inventory').deleteOne(
      { _id: new ObjectId(params.id), restaurantId }
    )

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete inventory error:', error)
    return NextResponse.json({ message: 'Failed to delete inventory item' }, { status: 500 })
  }
}