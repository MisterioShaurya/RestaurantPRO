import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'
import fs from 'fs'
import path from 'path'

const TABLES_DIR_PATH = path.join(process.cwd(), 'data', 'tables')

// Ensure tables directory exists
function ensureTablesDir() {
  if (!fs.existsSync(TABLES_DIR_PATH)) {
    fs.mkdirSync(TABLES_DIR_PATH, { recursive: true })
  }
}

function getTablesFilePath(restaurantId: string) {
  ensureTablesDir()
  return path.join(TABLES_DIR_PATH, `${restaurantId}.json`)
}

function readTablesFromFile(restaurantId: string) {
  try {
    const filePath = getTablesFilePath(restaurantId)
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('[Tables] Error reading tables file:', error)
    return []
  }
}

function writeTablesToFile(restaurantId: string, tables: any[]) {
  try {
    ensureTablesDir()
    const filePath = getTablesFilePath(restaurantId)
    fs.writeFileSync(filePath, JSON.stringify(tables, null, 2))
  } catch (error) {
    console.error('[Tables] Error writing tables file:', error)
  }
}

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    
    if (!restaurantId) {
      return NextResponse.json({ tables: [] })
    }

    // Try to read from JSON file first (for offline support)
    let tables = readTablesFromFile(restaurantId)

    // If JSON is empty, try database
    if (!tables || tables.length === 0) {
      try {
        const client = await getMongoClient()
        const db = client.db('restaurant_pos')
        tables = await db.collection('tables').find({ restaurantId }).toArray()

        // Only create default tables if this is a new user (check if any tables exist in DB)
        if (tables.length === 0) {
          // Check if user has ever created tables before
          const userHasTables = await db.collection('tables').countDocuments({ restaurantId }, { limit: 1 })
          
          if (userHasTables === 0) {
            // New user - create default tables
            const defaultTables = Array.from({ length: 12 }, (_, i) => ({
              restaurantId,
              number: i + 1,
              capacity: i < 4 ? 2 : i < 8 ? 4 : 6,
              status: 'available',
              isDefault: true,
              createdAt: new Date(),
            }))
            await db.collection('tables').insertMany(defaultTables)
            tables = await db.collection('tables').find({ restaurantId }).toArray()
          }
        }
        
        if (tables.length > 0) {
          writeTablesToFile(restaurantId, tables)
        }
      } catch (dbError) {
        console.error('[Tables] Database error:', dbError)
        // Don't create default tables on error, return empty array
        tables = []
      }
    }

    const normalized = tables.map((t: any) => ({ ...t, _id: t._id?.toString() || t._id }))
    return NextResponse.json({ tables: normalized })
  } catch (error) {
    console.error('[Tables] GET error:', error)
    return NextResponse.json({ tables: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(request)
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { number, capacity, status, isDefault } = await request.json()
    if (typeof number !== 'number' || typeof capacity !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const tableData = {
      restaurantId,
      number,
      capacity,
      status: status || 'available',
      isDefault: isDefault || false,
      createdAt: new Date(),
    }

    // Try to save to database first
    let dbId: string | null = null
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')
      const result = await db.collection('tables').insertOne(tableData)
      dbId = result.insertedId.toString()
    } catch (dbError) {
      console.error('[Tables] Database sync error:', dbError)
      // Continue with local storage
      dbId = Date.now().toString()
    }

    const newTable = {
      _id: dbId,
      ...tableData,
    }

    // Read current tables and add new one
    let tables = readTablesFromFile(restaurantId)
    tables.push(newTable)
    writeTablesToFile(restaurantId, tables)

    return NextResponse.json({ table: newTable }, { status: 201 })
  } catch (error) {
    console.error('[Tables] POST error:', error)
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(request)
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tableId, status, tableName } = await request.json()
    
    if (!tableId) {
      return NextResponse.json({ error: 'Missing tableId' }, { status: 400 })
    }

    // Build update object
    const updateData: any = {}
    if (status) updateData.status = status
    if (tableName !== undefined) updateData.tableName = tableName

    // Update local file
    let tables = readTablesFromFile(restaurantId)
    const tableIndex = tables.findIndex((t: any) => t._id?.toString() === tableId || t._id === tableId)
    
    if (tableIndex !== -1) {
      if (status) tables[tableIndex].status = status
      if (tableName !== undefined) tables[tableIndex].tableName = tableName
      writeTablesToFile(restaurantId, tables)
    }

    // Try to sync with database
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')
      await db.collection('tables').updateOne(
        { _id: tableId, restaurantId },
        { $set: updateData }
      )
    } catch (dbError) {
      console.error('[Tables] Database sync error:', dbError)
      // Continue with local storage
    }

    return NextResponse.json({ message: 'Table updated successfully' })
  } catch (error) {
    console.error('[Tables] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 })
  }
}
