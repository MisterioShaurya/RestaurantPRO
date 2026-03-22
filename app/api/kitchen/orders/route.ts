import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await getMongoClient()
    const db = client.db('restaurant_pro')
    const orders = await db
      .collection('orders')
      .find({ status: { $ne: 'completed' } })
      .sort({ createdAt: 1 })
      .limit(1000)
      .toArray()

    // Normalize _id and createdAt for client-side use
    const normalized = (orders || []).map((o: any) => ({
      ...o,
      _id: o._id?.toString(),
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,
    }))

    return NextResponse.json({ orders: normalized })
  } catch (error) {
    console.error('Kitchen orders error:', error)
    return NextResponse.json({ orders: [] })
  }
}
