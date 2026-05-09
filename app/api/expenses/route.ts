import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    if (!restaurantId) {
      return NextResponse.json({ expenses: [] })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const expenses = await db.collection('expenses')
      .find({ restaurantId })
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json({ expenses })
  } catch (error) {
    console.error('Fetch expenses error:', error)
    return NextResponse.json({ expenses: [] })
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

    const expense = {
      type: data.type || 'general',
      description: data.description,
      amount: Number(data.amount),
      category: data.category || 'General',
      date: new Date(data.date || new Date()),
      restaurantId,
      createdAt: new Date(),
    }

    const result = await db.collection('expenses').insertOne(expense)

    return NextResponse.json(
      { expense: { _id: result.insertedId, ...expense } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add expense error:', error)
    return NextResponse.json({ message: 'Failed to add expense' }, { status: 500 })
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

    await db.collection('expenses').deleteOne(
      { _id: new ObjectId(id), restaurantId }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete expense error:', error)
    return NextResponse.json({ message: 'Failed to delete expense' }, { status: 500 })
  }
}