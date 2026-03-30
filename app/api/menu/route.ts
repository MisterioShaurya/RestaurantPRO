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

// Auth helper for POST operations (menu management)
async function getUserFromToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return decoded
  } catch (error) {
    console.error('[Menu] Token verification error:', error)
    return null
  }
}

import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

// Public GET endpoint - no auth required for POS system
export async function GET(request: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(request)
    
    if (!restaurantId) {
      return NextResponse.json({ items: [] })
    }

    // Try to read from database first
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')
      const items = await db.collection('menu').find({ restaurantId }).toArray()

      // Filter only available items for POS
      const availableItems = items.filter((item: any) => item.available !== false)

      return NextResponse.json({
        items: availableItems.map((item: any) => ({
          ...item,
          _id: item._id ? item._id.toString() : `item-${Date.now()}`,
        }))
      })
    } catch (dbError) {
      console.error('[Menu] Database error:', dbError)

      // Fallback to JSON file
      let items = readMenuFromFile()

      // Filter only available items
      items = items.filter((item: any) => item.available !== false)

      // Normalize _id values
      items = items.map((item: any) => ({
        ...item,
        _id: item._id?.$oid ? item._id.$oid : (item._id ? item._id.toString() : `item-${Date.now()}`),
      }))

      return NextResponse.json({ items })
    }
  } catch (error: any) {
    console.error('[Menu] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const restaurantId = await getRestaurantIdFromRequest(request)
    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 })
    }

    const body = await request.json()
    const menuItem = {
      ...body,
      restaurantId,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')
      const result = await db.collection('menu').insertOne(menuItem)

      return NextResponse.json({
        ...menuItem,
        _id: result.insertedId.toString(),
      })
    } catch (dbError) {
      console.error('[Menu] Database insert error:', dbError)

      // Fallback to JSON file
      let items = readMenuFromFile()
      const newItem = {
        ...menuItem,
        _id: `item-${Date.now()}`,
      }
      items.push(newItem)
      writeMenuToFile(items)

      return NextResponse.json(newItem)
    }
  } catch (error: any) {
    console.error('[Menu] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
