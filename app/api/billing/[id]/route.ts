import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { status, paymentMethod } = await request.json()

    const client = await getMongoClient()
    const db = client.db('restaurant_pro')

    const updates: any = { status, updatedAt: new Date() }
    if (paymentMethod) updates.paymentMethod = paymentMethod

    const result = await db.collection('bills').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    )
  const bill = result?.value || null
  const normalized = bill ? { ...bill, _id: bill._id.toString(), createdAt: bill.createdAt?.toISOString(), updatedAt: bill.updatedAt?.toISOString() } : null
    return NextResponse.json({ bill: normalized }, { status: 200 })
  } catch (error) {
    console.error('Billing PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 })
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

    await db.collection('bills').deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Billing DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete bill' }, { status: 500 })
  }
}
