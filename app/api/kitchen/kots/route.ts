import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export interface KOT {
  _id?: string
  orderId: string
  orderNumber: string
  tableNumber?: number | null
  items: Array<{ name: string; quantity: number }>
  specialInstructions?: string
  status: 'pending' | 'received' | 'preparing' | 'ready' | 'served'
  chefId?: string
  createdAt: Date
  updatedAt: Date
  printedAt?: Date
  printCount: number
}

export async function GET(req: NextRequest) {
  try {
    const client = await getMongoClient()
    const db = client.db('restaurant_pro')
    
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const chefId = searchParams.get('chefId')
    
    const query: any = {}
    if (status) query.status = status
    if (chefId) query.chefId = chefId
    
    const kots = await db
      .collection('kots')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    const normalized = (kots || []).map((k: any) => ({
      ...k,
      _id: k._id?.toString(),
      createdAt: k.createdAt ? new Date(k.createdAt).toISOString() : null,
      updatedAt: k.updatedAt ? new Date(k.updatedAt).toISOString() : null,
      printedAt: k.printedAt ? new Date(k.printedAt).toISOString() : null,
    }))

    return NextResponse.json({ kots: normalized })
  } catch (error) {
    console.error('KOT GET error:', error)
    return NextResponse.json({ kots: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, orderNumber, tableNumber, items, specialInstructions, chefId } = await req.json()

    if (!orderId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid KOT data' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pro')

    const kotData = {
      orderId,
      orderNumber,
      tableNumber: tableNumber || null,
      items,
      specialInstructions: specialInstructions || '',
      status: 'pending',
      chefId: chefId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      printedAt: null,
      printCount: 0,
    }

    const result = await db.collection('kots').insertOne(kotData)
    const kot = await db.collection('kots').findOne({ _id: result.insertedId })
    
    const normalized = kot ? {
      ...kot,
      _id: kot._id.toString(),
      createdAt: kot.createdAt?.toISOString(),
      updatedAt: kot.updatedAt?.toISOString(),
      printedAt: kot.printedAt?.toISOString(),
    } : null

    return NextResponse.json({ kot: normalized }, { status: 201 })
  } catch (error) {
    console.error('KOT POST error:', error)
    return NextResponse.json({ error: 'Failed to create KOT' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { kotId, status, printCount, chefId } = await req.json()

    if (!kotId) {
      return NextResponse.json({ error: 'KOT ID required' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pro')

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status) updateData.status = status
    if (printCount !== undefined) {
      updateData.printCount = printCount
      if (printCount === 1) {
        updateData.printedAt = new Date()
      }
    }
    if (chefId) updateData.chefId = chefId

    const result = await db.collection('kots').findOneAndUpdate(
      { _id: new ObjectId(kotId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    const kot = result?.value
    const normalized = kot ? {
      ...kot,
      _id: kot._id.toString(),
      createdAt: kot.createdAt?.toISOString(),
      updatedAt: kot.updatedAt?.toISOString(),
      printedAt: kot.printedAt?.toISOString(),
    } : null

    return NextResponse.json({ kot: normalized })
  } catch (error) {
    console.error('KOT PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update KOT' }, { status: 500 })
  }
}
