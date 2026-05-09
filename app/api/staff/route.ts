import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    
    if (!restaurantId) {
      return NextResponse.json({ staff: [] })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const staff = await db.collection('staff').find({ restaurantId }).toArray()

    return NextResponse.json({ staff: staff || [] })
  } catch (error) {
    console.error('Staff error:', error)
    return NextResponse.json({ staff: [] })
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

    const staff = await db.collection('staff').insertOne({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      salary: data.salary ? Number(data.salary) : 0,
      salaryDay: data.salaryDay ? Number(data.salaryDay) : 1,
      restaurantId,
      status: 'active',
      joinDate: new Date(),
      createdAt: new Date(),
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