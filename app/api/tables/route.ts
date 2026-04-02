import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req)
    
    if (!restaurantId) {
      return NextResponse.json({ tables: [] })
    }

    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pro')
      let tables = await db.collection('tables').find({ restaurantId }).toArray()

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

      const normalized = tables.map((t: any) => ({ ...t, _id: t._id?.toString() || t._id }))
      return NextResponse.json({ tables: normalized })
    } catch (dbError) {
      console.error('[Tables] Database error:', dbError)
      return NextResponse.json({ tables: [] })
    }
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

    const body = await request.json()
    
    // Support bulk creation
    if (body.tables && Array.isArray(body.tables)) {
      const tablesToCreate = body.tables.map((table: any) => ({
        restaurantId,
        number: table.number,
        capacity: table.capacity || 2,
        status: table.status || 'available',
        tableName: table.tableName || '',
        isDefault: false,
        createdAt: new Date(),
      }))

      const client = await getMongoClient()
      const db = client.db('restaurant_pro')
      const result = await db.collection('tables').insertMany(tablesToCreate)
      
      const createdTables = tablesToCreate.map((t: any, i: number) => ({
        _id: result.insertedIds[i].toString(),
        ...t,
      }))

      return NextResponse.json({ tables: createdTables }, { status: 201 })
    }
    
    // Single table creation
    const { number, capacity, status, isDefault, tableName } = body
    if (typeof number !== 'number' || typeof capacity !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const tableData = {
      restaurantId,
      number,
      capacity,
      status: status || 'available',
      tableName: tableName || '',
      isDefault: isDefault || false,
      createdAt: new Date(),
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pro')
    const result = await db.collection('tables').insertOne(tableData)
    
    const newTable = {
      _id: result.insertedId.toString(),
      ...tableData,
    }

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

    console.log('[Tables] Updating table:', { tableId, updateData, restaurantId })

    const client = await getMongoClient()
    const db = client.db('restaurant_pro')
    
    // Try to update by ObjectId first, then by string ID
    let result = await db.collection('tables').updateOne(
      { _id: new ObjectId(tableId), restaurantId },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      // Try with string ID
      console.log('[Tables] ObjectId not found, trying string ID')
      result = await db.collection('tables').updateOne(
        { _id: tableId, restaurantId },
        { $set: updateData }
      )
    }

    if (result.matchedCount === 0) {
      console.log('[Tables] Table not found for update')
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    // Fetch and return the updated table
    let updatedTable = await db.collection('tables').findOne(
      { _id: new ObjectId(tableId), restaurantId }
    )
    
    if (!updatedTable) {
      updatedTable = await db.collection('tables').findOne(
        { _id: tableId, restaurantId }
      )
    }

    if (updatedTable) {
      const normalized = { ...updatedTable, _id: updatedTable._id.toString() }
      console.log('[Tables] Table updated successfully:', normalized)
      return NextResponse.json({ table: normalized })
    }

    return NextResponse.json({ message: 'Table updated successfully' })
  } catch (error) {
    console.error('[Tables] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(request)
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get('tableId')
    
    if (!tableId) {
      return NextResponse.json({ error: 'Missing tableId' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pro')
    
    try {
      const result = await db.collection('tables').deleteOne(
        { _id: new ObjectId(tableId), restaurantId }
      )
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Table not found' }, { status: 404 })
      }
    } catch (objectIdError) {
      // If ObjectId conversion fails, try with string ID
      const result = await db.collection('tables').deleteOne(
        { _id: tableId as any, restaurantId }
      )
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Table not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ message: 'Table deleted successfully' })
  } catch (error) {
    console.error('[Tables] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 })
  }
}
