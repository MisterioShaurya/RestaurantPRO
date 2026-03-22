import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import fs from 'fs'
import path from 'path'

const MENU_FILE_PATH = path.join(process.cwd(), 'menu.json')

function readMenuFromFile() {
  try {
    const data = fs.readFileSync(MENU_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('[Menu] Error reading menu.json:', error)
    return []
  }
}

function writeMenuToFile(menuItems: any[]) {
  try {
    fs.writeFileSync(MENU_FILE_PATH, JSON.stringify(menuItems, null, 2))
  } catch (error) {
    console.error('[Menu] Error writing menu.json:', error)
  }
}

export async function GET() {
  try {
    // Try to read from JSON file first (for offline support)
    let items = readMenuFromFile()

    // Normalize _id values (convert objects to strings)
    items = items.map((item: any) => ({
      ...item,
      _id: item._id?.$oid ? item._id.$oid : (item._id ? item._id.toString() : `item-${Date.now()}`),
    }))

    // If JSON is empty or not found, try database
    if (!items || items.length === 0) {
      try {
        const client = await getMongoClient()
        const db = client.db('restaurant_pro')
        items = await db.collection('menu').find({}).toArray()
        items = items.map((item: any) => ({
          ...item,
          _id: item._id ? item._id.toString() : `item-${Date.now()}`,
        }))
        // Write to JSON for offline use
        writeMenuToFile(items)
      } catch (dbError) {
        console.error('[Menu] Database error:', dbError)
        // Return empty if both fail
        items = []
      }
    }

    return NextResponse.json({ items })
  } catch (error) {
    console.error('[Menu] GET error:', error)
    return NextResponse.json({ items: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, price, category, available, description } = await request.json()

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newItem = {
      _id: Date.now().toString(), // Simple ID generation
      name,
      price: Number(price),
      category,
      available: available !== false,
      description: description || '',
      createdAt: new Date(),
    }

    // Read current menu
    let items = readMenuFromFile()
    items.push(newItem)
    writeMenuToFile(items)

    // Try to sync with database
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pro')
      const result = await db.collection('menu').insertOne({
        ...newItem,
        _id: new ObjectId(), // Use ObjectId for database
      })
      // Update the item with database ID
      newItem._id = result.insertedId.toString()
      items[items.length - 1] = newItem
      writeMenuToFile(items)
    } catch (dbError) {
      console.error('[Menu] Database sync error:', dbError)
      // Continue with local storage
    }

    return NextResponse.json({ item: newItem }, { status: 201 })
  } catch (error) {
    console.error('[Menu] POST error:', error)
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
  }
}
