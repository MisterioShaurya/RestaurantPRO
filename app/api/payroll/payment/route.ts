import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    if (!restaurantId) {
      return NextResponse.json({ payments: [] })
    }

    const { searchParams } = new URL(req.url)
    const staffId = searchParams.get('staffId')
    const month = searchParams.get('month')

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    let query: any = { restaurantId }
    if (staffId) query.staffId = staffId
    if (month) query.month = month

    const payments = await db.collection('payroll_payments')
      .find(query)
      .sort({ paidDate: -1 })
      .toArray()

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Fetch payments error:', error)
    return NextResponse.json({ payments: [] })
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

    // Check if payment already exists for this staff+month
    const existing = await db.collection('payroll_payments').findOne({
      staffId: data.staffId,
      month: data.month,
      restaurantId,
    })

    const advancesDeducted = data.advancesDeducted ? Number(data.advancesDeducted) : 0
    const netAmount = data.netAmount ? Number(data.netAmount) : (Number(data.salary) - advancesDeducted)

    if (existing) {
      await db.collection('payroll_payments').updateOne(
        { _id: existing._id },
        { 
          $set: { 
            paid: true, 
            paidDate: new Date(), 
            advancesDeducted,
            netAmount,
            updatedAt: new Date() 
          } 
        }
      )
      return NextResponse.json({ success: true, message: 'Payment updated' })
    }

    const payment = {
      staffId: data.staffId,
      staffName: data.staffName,
      role: data.role,
      salary: Number(data.salary),
      advancesDeducted,
      netAmount: netAmount > 0 ? netAmount : 0,
      month: data.month,
      paid: true,
      paidDate: new Date(),
      restaurantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('payroll_payments').insertOne(payment)

    // Also log this as an expense
    await db.collection('expenses').insertOne({
      type: 'salary',
      description: `Salary payment - ${data.staffName} for ${data.month}`,
      amount: Number(data.salary),
      category: 'Salary',
      date: new Date(),
      staffId: data.staffId,
      month: data.month,
      restaurantId,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true, message: 'Payment recorded' }, { status: 201 })
  } catch (error) {
    console.error('Record payment error:', error)
    return NextResponse.json({ message: 'Failed to record payment' }, { status: 500 })
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

    await db.collection('payroll_payments').deleteOne(
      { _id: new ObjectId(id), restaurantId }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete payment error:', error)
    return NextResponse.json({ message: 'Failed to delete payment' }, { status: 500 })
  }
}