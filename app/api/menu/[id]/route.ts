import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updates = await request.json()

    const client = await getMongoClient()
    const db = client.db('restaurant_pro')

    // Convert price to number if provided
    if (updates.price) {
      updates.price = Number(updates.price)
    }

    const result = await db.collection('menu').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    )

    return NextResponse.json({ item: result.value }, { status: 200 })
  } catch (error) {
    console.error('Menu PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const client = await getMongoClient()
    const db = client.db('restaurant_pro')

    await db.collection('menu').deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Menu DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
  }
}
