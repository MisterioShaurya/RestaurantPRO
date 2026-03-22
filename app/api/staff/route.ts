import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await getMongoClient()
    const db = client.db('restaurant_pro')
    const staff = await db.collection('staff').find().toArray()

    return NextResponse.json({ staff: staff || [] })
  } catch (error) {
    console.error('Staff error:', error)
    return NextResponse.json({ staff: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const client = await getMongoClient()
    const db = client.db('restaurant_pro')

    const staff = await db.collection('staff').insertOne({
      ...data,
      status: 'active',
      joinDate: new Date(),
    })

    return NextResponse.json(
      { staff: { _id: staff.insertedId, ...data, status: 'active' } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add staff error:', error)
    return NextResponse.json({ message: 'Failed to add staff' }, { status: 500 })
  }
}
