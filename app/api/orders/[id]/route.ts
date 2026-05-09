import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'
import { ObjectId } from 'mongodb'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    const { status } = await req.json()

    // Try to update in database
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')
      let query: any = { restaurantId }
      if (ObjectId.isValid(params.id)) {
        query._id = new ObjectId(params.id)
      } else {
        query.id = params.id
      }
      const result = await db.collection('orders').updateOne(
        query,
        { $set: { status, updatedAt: new Date().toISOString() } }
      )
      if (result.matchedCount > 0) {
        return NextResponse.json({ success: true, message: 'Order updated in database' })
      }
    } catch (dbError) {
      console.error('Database update error:', dbError)
    }

    // Return success anyway (client handles local storage)
    return NextResponse.json({
      order: { id: params.id, status },
      message: 'Order updated (handled client-side)',
    })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { message: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)

    // Try to delete from database
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')
      let query: any = { restaurantId }
      if (ObjectId.isValid(params.id)) {
        query._id = new ObjectId(params.id)
      } else {
        query.id = params.id
      }
      const result = await db.collection('orders').deleteOne(query)

      if (result.deletedCount > 0) {
        return NextResponse.json({
          success: true,
          message: 'Order deleted from database',
        })
      }
    } catch (dbError) {
      console.error('Database delete error:', dbError)
    }

    // Return success anyway (client handles local storage)
    return NextResponse.json({
      success: true,
      message: 'Order deleted (handled client-side)',
    })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json(
      { message: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
