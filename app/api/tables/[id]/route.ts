import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await req.json()
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const result = await db.collection('tables').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    )

    return NextResponse.json({ updated: result.modifiedCount > 0 })
  } catch (error) {
    console.error('Update table error:', error)
    return NextResponse.json({ message: 'Failed to update table' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tableId } = await params

    // Delete from database
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')
      await db.collection('tables').deleteOne({ _id: new ObjectId(tableId) })
    } catch (dbError) {
      console.error('[Tables] Database delete error:', dbError)
    }

    // Delete from local file
    let tables = readTablesFromFile()
    tables = tables.filter((t: any) => t._id?.toString() !== tableId && t._id !== tableId)
    writeTablesToFile(tables)

    return NextResponse.json({ message: 'Table deleted successfully' })
  } catch (error) {
    console.error('Delete table error:', error)
    return NextResponse.json({ message: 'Failed to delete table' }, { status: 500 })
  }
}
