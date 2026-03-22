  import { NextRequest, NextResponse } from 'next/server'
  import { getMongoClient } from '@/lib/mongodb'

  export async function GET() {
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pro')
      
      const bills = await db
        .collection('bills')
        .find({})
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
      const { tableNumber, items, subtotal, tax, discount, total, taxRate, discountPercent, paymentMode, customerName, customerPhone } = await request.json()

      if (!items || items.length === 0) {
        return NextResponse.json({ error: 'No items in bill' }, { status: 400 })
      }

      const client = await getMongoClient()
      const db = client.db('restaurant_pro')

      // Generate bill number
      const lastBill = await db.collection('bills').findOne({}, { sort: { createdAt: -1 } })
      const billNumber = lastBill 
        ? `BILL-${(parseInt(lastBill.billNumber.split('-')[1]) + 1).toString().padStart(5, '0')}`
        : 'BILL-00001'

      const billData = {
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
    const bill = await db.collection('bills').findOne({ _id: result.insertedId })
    const normalized = bill ? { ...bill, _id: bill._id.toString(), createdAt: bill.createdAt?.toISOString(), updatedAt: bill.updatedAt?.toISOString() } : null

    return NextResponse.json({ bill: normalized }, { status: 201 })
    } catch (error) {
      console.error('Billing POST error:', error)
      return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 })
    }
  }
