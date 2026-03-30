import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'

export async function GET(req: NextRequest) {
  try {
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const kots = await db.collection('kots').find({}).toArray()
    return NextResponse.json({ kots })
  } catch (error) {
    console.error('[KOT] GET error:', error)
    return NextResponse.json({ kots: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const kot = await req.json()

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    
    if (!kot.createdAt) {
      kot.createdAt = new Date().toISOString()
    }
    
    const result = await db.collection('kots').insertOne(kot)

    return NextResponse.json({ kot: { ...kot, _id: result.insertedId } }, { status: 201 })
  } catch (error) {
    console.error('[KOT] POST error:', error)
    return NextResponse.json({ message: 'Failed to create KOT' }, { status: 500 })
  }
}
