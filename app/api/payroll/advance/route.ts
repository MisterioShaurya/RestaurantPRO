import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    if (!restaurantId) {
      return NextResponse.json({ advances: [] })
    }

    const { searchParams } = new URL(req.url)
    const staffId = searchParams.get('staffId')

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    let query: any = { restaurantId }
    if (staffId) {
      query.staffId = staffId
    }

    const advances = await db.collection('payroll_advances')
      .find(query)
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json({ advances })
  } catch (error) {
    console.error('Fetch advances error:', error)
    return NextResponse.json({ advances: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    if (!restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const advance = {
      staffId: data.staffId,
      staffName: data.staffName,
      amount: Number(data.amount),
      reason: data.reason || 'Salary Advance',
      date: new Date(data.date || new Date()),
      restaurantId,
      createdAt: new Date(),
    }

    const result = await db.collection('payroll_advances').insertOne(advance)

    return NextResponse.json(
      { advance: { _id: result.insertedId, ...advance } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add advance error:', error)
    return NextResponse.json({ message: 'Failed to add advance' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    if (!restaurantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const result = await db.collection('payroll_advances').deleteOne(
      { _id: new ObjectId(id), restaurantId }
    )

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Advance not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete advance error:', error)
    return NextResponse.json({ message: 'Failed to delete advance' }, { status: 500 })
  }
}