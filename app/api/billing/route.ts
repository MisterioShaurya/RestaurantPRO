import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    
    if (!restaurantId) {
      return NextResponse.json({ bills: [] }, { status: 200 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    
    const bills = await db
      .collection('bills')
      .find({ restaurantId })
      .sort({ createdAt: -1 })
      .toArray()

      // normalize ids and dates to safe JSON types
      const normalized = (bills || []).map((b: any) => ({
        ...b,
        _id: b._id?.toString(),
        createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : null,
        updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : null,
      }))

      return NextResponse.json({ bills: normalized })
    } catch (error) {
      console.error('Billing GET error:', error)
      return NextResponse.json({ bills: [] }, { status: 200 })
    }
  }

export async function POST(request: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(request)
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tableNumber, items, subtotal, tax, discount, total, taxRate, discountPercent, paymentMode, customerName, customerPhone } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in bill' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

      // Generate bill number
      const lastBill = await db.collection('bills').findOne({}, { sort: { createdAt: -1 } })
      const billNumber = lastBill 
        ? `BILL-${(parseInt(lastBill.billNumber.split('-')[1]) + 1).toString().padStart(5, '0')}`
        : 'BILL-00001'

    const billData = {
      restaurantId,
      billNumber,
      tableNumber: tableNumber || null,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      items,
      subtotal: Number(subtotal),
      tax: Number(tax),
      discount: Number(discount),
      total: Number(total),
      taxRate: Number(taxRate),
      discountPercent: Number(discountPercent),
      status: 'paid', // Mark as paid when bill is created and payment mode is selected
      paymentMode: paymentMode || null,
      paymentMethod: paymentMode || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('bills').insertOne(billData)
    
    // Update the order status to 'completed' when bill is created
    if (tableNumber) {
      await db.collection('orders').updateMany(
        { 
          restaurantId,
          tableNumber: Number(tableNumber),
          status: { $ne: 'completed' }
        },
        { 
          $set: { 
            status: 'completed',
            paymentStatus: 'paid',
            paymentMode: paymentMode || null,
            updatedAt: new Date().toISOString()
          } 
        }
      )
    }
    
    const bill = await db.collection('bills').findOne({ _id: result.insertedId })
    const normalized = bill ? { ...bill, _id: bill._id.toString(), createdAt: bill.createdAt instanceof Date ? bill.createdAt.toISOString() : bill.createdAt, updatedAt: bill.updatedAt instanceof Date ? bill.updatedAt.toISOString() : bill.updatedAt } : null

    return NextResponse.json({ bill: normalized }, { status: 201 })
    } catch (error) {
      console.error('Billing POST error:', error)
      return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 })
    }
  }
