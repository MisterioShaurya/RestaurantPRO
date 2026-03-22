import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import fs from 'fs'
import path from 'path'

const INVENTORY_FILE_PATH = path.join(process.cwd(), 'inventory.json')

function readInventoryFromFile() {
  try {
    const data = fs.readFileSync(INVENTORY_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('[Inventory] Error reading inventory.json:', error)
    return []
  }
}

function writeInventoryToFile(items: any[]) {
  try {
    fs.writeFileSync(INVENTORY_FILE_PATH, JSON.stringify(items, null, 2))
  } catch (error) {
    console.error('[Inventory] Error writing inventory.json:', error)
  }
}

export async function GET() {
  try {
    // Try to read from JSON file first (for offline support)
    let items = readInventoryFromFile()

    // If JSON is empty, try database
    if (!items || items.length === 0) {
      try {
        const client = await getMongoClient()
        const db = client.db('restaurant_pro')
        items = await db.collection('inventory').find().toArray()
        writeInventoryToFile(items)
      } catch (dbError) {
        console.error('[Inventory] Database error:', dbError)
        items = []
      }
    }

    return NextResponse.json({ items })
  } catch (error) {
    console.error('[Inventory] GET error:', error)
    return NextResponse.json({ items: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const newItem = {
      _id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
    }

    // Read current inventory
    let items = readInventoryFromFile()
    items.push(newItem)
    writeInventoryToFile(items)

    // Try to sync with database
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pro')
      const result = await db.collection('inventory').insertOne(newItem)
      newItem._id = result.insertedId.toString()
      items[items.length - 1] = newItem
      writeInventoryToFile(items)
    } catch (dbError) {
      console.error('[Inventory] Database sync error:', dbError)
      // Continue with local storage
    }

    return NextResponse.json({ item: newItem }, { status: 201 })
  } catch (error) {
    console.error('[Inventory] POST error:', error)
    return NextResponse.json({ message: 'Failed to add item' }, { status: 500 })
  }
}
