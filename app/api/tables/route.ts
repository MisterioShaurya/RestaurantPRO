import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import fs from 'fs'
import path from 'path'

const TABLES_FILE_PATH = path.join(process.cwd(), 'tables.json')

function readTablesFromFile() {
  try {
    const data = fs.readFileSync(TABLES_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('[Tables] Error reading tables.json:', error)
    return []
  }
}

function writeTablesToFile(tables: any[]) {
  try {
    fs.writeFileSync(TABLES_FILE_PATH, JSON.stringify(tables, null, 2))
  } catch (error) {
    console.error('[Tables] Error writing tables.json:', error)
  }
}

export async function GET() {
  try {
    // Try to read from JSON file first (for offline support)
    let tables = readTablesFromFile()

    // If JSON is empty, try database
    if (!tables || tables.length === 0) {
      try {
        const client = await getMongoClient()
        const db = client.db('restaurant_pro')
        tables = await db.collection('tables').find().toArray()

        if (tables.length === 0) {
          const defaultTables = Array.from({ length: 12 }, (_, i) => ({
            number: i + 1,
            capacity: i < 4 ? 2 : i < 8 ? 4 : 6,
            status: 'available',
            createdAt: new Date(),
          }))
          await db.collection('tables').insertMany(defaultTables)
          tables = await db.collection('tables').find().toArray()
        }
        writeTablesToFile(tables)
      } catch (dbError) {
        console.error('[Tables] Database error:', dbError)
        // Use default tables if both fail
        tables = Array.from({ length: 12 }, (_, i) => ({
          _id: (i + 1).toString(),
          number: i + 1,
          capacity: i < 4 ? 2 : i < 8 ? 4 : 6,
          status: 'available',
        }))
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
    const { number, capacity, status } = await request.json()
    if (typeof number !== 'number' || typeof capacity !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newTable = {
      _id: Date.now().toString(),
      number,
      capacity,
      status: status || 'available',
      createdAt: new Date(),
    }

    // Read current tables
    let tables = readTablesFromFile()
    tables.push(newTable)
    writeTablesToFile(tables)

    // Try to sync with database
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pro')
      const result = await db.collection('tables').insertOne(newTable)
      newTable._id = result.insertedId.toString()
      tables[tables.length - 1] = newTable
      writeTablesToFile(tables)
    } catch (dbError) {
      console.error('[Tables] Database sync error:', dbError)
      // Continue with local storage
    }

    const normalized = { ...newTable, _id: newTable._id?.toString() || newTable._id }
    return NextResponse.json({ table: normalized }, { status: 201 })
  } catch (error) {
    console.error('[Tables] POST error:', error)
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
  }
}
