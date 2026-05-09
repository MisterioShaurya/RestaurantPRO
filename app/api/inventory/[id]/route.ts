import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { quantity, ...otherUpdates } = await req.json()
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    // Try MongoDB update first
    try {
      const updateData: any = {}
      if (quantity !== undefined) updateData.quantity = quantity
      Object.assign(updateData, otherUpdates)

      const result = await db.collection('inventory').updateOne(
        { _id: new ObjectId(params.id) },
        { $set: updateData }
      )

      if (result.matchedCount > 0) {
        return NextResponse.json({ updated: true })
      }
    } catch (dbError) {
      console.error('[Inventory] Database update error:', dbError)
    }

    // Fallback to JSON file
    let items = readInventoryFromFile()
    const index = items.findIndex((item: any) => item._id === params.id || item._id?.$oid === params.id)
    
    if (index === -1) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 })
    }

    if (quantity !== undefined) items[index].quantity = quantity
    if (otherUpdates.name) items[index].name = otherUpdates.name
    if (otherUpdates.unit) items[index].unit = otherUpdates.unit
    if (otherUpdates.minStock !== undefined) items[index].minStock = otherUpdates.minStock
    if (otherUpdates.cost !== undefined) items[index].cost = otherUpdates.cost
    if (otherUpdates.category) items[index].category = otherUpdates.category

    writeInventoryToFile(items)
    return NextResponse.json({ updated: true })
  } catch (error) {
    console.error('Update inventory error:', error)
    return NextResponse.json({ message: 'Failed to update inventory' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    // Try MongoDB delete first
    try {
      const result = await db.collection('inventory').deleteOne({ _id: new ObjectId(params.id) })
      if (result.deletedCount > 0) {
        return NextResponse.json({ success: true })
      }
    } catch (dbError) {
      console.error('[Inventory] Database delete error:', dbError)
    }

    // Fallback to JSON file
    let items = readInventoryFromFile()
    const filtered = items.filter((item: any) => item._id !== params.id && item._id?.$oid !== params.id)
    
    if (filtered.length === items.length) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 })
    }

    writeInventoryToFile(filtered)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete inventory error:', error)
    return NextResponse.json({ message: 'Failed to delete inventory item' }, { status: 500 })
  }
}