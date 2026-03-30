import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getMongoClient } from '@/lib/mongodb'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { quantity } = await req.json()
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const result = await db.collection('inventory').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { quantity } }
    )

    return NextResponse.json({ updated: result.modifiedCount > 0 })
  } catch (error) {
    console.error('Update inventory error:', error)
    return NextResponse.json({ message: 'Failed to update inventory' }, { status: 500 })
  }
}
