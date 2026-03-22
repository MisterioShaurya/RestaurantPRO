import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getMongoClient } from '@/lib/mongodb'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json()
    const client = await getMongoClient()
    const db = client.db('restaurant_pro')

    const result = await db.collection('reservations').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { status } }
    )

    return NextResponse.json({ updated: result.modifiedCount > 0 })
  } catch (error) {
    console.error('Update reservation error:', error)
    return NextResponse.json({ message: 'Failed to update reservation' }, { status: 500 })
  }
}
