import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const tableNumber = url.searchParams.get('tableNumber')

    const client = await getMongoClient()
    const db = client.db('restaurant_pro')

    const query: any = {}
    if (tableNumber) query.tableNumber = Number(tableNumber)

    const preorders = await db.collection('preorders').find(query).sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ preorders })
  } catch (error) {
    console.error('Preorders GET error:', error)
    return NextResponse.json({ preorders: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tableNumber, items } = await request.json()
    if (!tableNumber || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pro')

    const result = await db.collection('preorders').insertOne({
      tableNumber: Number(tableNumber),
      items,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const preorder = await db.collection('preorders').findOne({ _id: result.insertedId })
    return NextResponse.json({ preorder }, { status: 201 })
  } catch (error) {
    console.error('Preorders POST error:', error)
    return NextResponse.json({ error: 'Failed to create preorder' }, { status: 500 })
  }
}
