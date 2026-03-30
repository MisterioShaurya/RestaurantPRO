import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    
    if (!restaurantId) {
      return NextResponse.json({ reservations: [] })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const reservations = await db.collection('reservations').find({ restaurantId }).toArray()

    return NextResponse.json({ reservations: reservations || [] })
  } catch (error) {
    console.error('Reservations error:', error)
    return NextResponse.json({ reservations: [] })
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

    const reservation = await db.collection('reservations').insertOne({
      ...data,
      restaurantId,
      status: 'pending',
      createdAt: new Date(),
    })

    return NextResponse.json(
      { reservation: { _id: reservation.insertedId, ...data, status: 'pending' } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add reservation error:', error)
    return NextResponse.json({ message: 'Failed to add reservation' }, { status: 500 })
  }
}
