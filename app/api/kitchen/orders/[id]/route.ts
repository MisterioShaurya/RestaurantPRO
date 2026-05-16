import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getMongoClient } from '@/lib/mongodb'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json()
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    // Update both status and kotStatus in the order document
    const updateFields: Record<string, any> = { 
      status, 
      updatedAt: new Date().toISOString() 
    }
    
    // Map status to kotStatus for cross-system compatibility
    if (status === 'ready' || status === 'completed') {
      updateFields.kotStatus = 'done'
      updateFields.isDone = true
    } else if (status === 'preparing') {
      updateFields.kotStatus = 'preparing'
    } else if (status === 'cancelled') {
      updateFields.kotStatus = 'cancelled'
    }

    let result: any

    // 1. Try ObjectId format
    try {
      result = await db.collection('orders').updateOne(
        { _id: new ObjectId(params.id) },
        { $set: updateFields }
      )
    } catch {
      result = null as any
    }

    // 2. Try custom string ID format (order-xxx)
    if (!result || result.matchedCount === 0) {
      result = await db.collection('orders').updateOne(
        { id: params.id },
        { $set: updateFields }
      )
    }

    // 3. Try _id as string format  
    if (!result || result.matchedCount === 0) {
      try {
        result = await db.collection('orders').updateOne(
          { _id: params.id as any },
          { $set: updateFields }
        )
      } catch {
        // ignore
      }
    }

    return NextResponse.json({ 
      updated: result ? result.modifiedCount > 0 : false,
      matched: result ? result.matchedCount : 0,
      orderStatus: status
    })
  } catch (error) {
    console.error('Update kitchen order error:', error)
    return NextResponse.json({ message: 'Failed to update order' }, { status: 500 })
  }
}