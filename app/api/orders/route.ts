import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ORDERS_FILE_PATH = path.join(process.cwd(), 'orders.json')

function readOrdersFromFile() {
  try {
    const data = fs.readFileSync(ORDERS_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('[Orders] Error reading orders.json:', error)
    return []
  }
}

function writeOrdersToFile(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2))
  } catch (error) {
    console.error('[Orders] Error writing orders.json:', error)
  }
}

export async function GET(req: NextRequest) {
  try {
    const orders = readOrdersFromFile()
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('[Orders] GET error:', error)
    return NextResponse.json({ orders: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const order = await req.json()

    let orders = readOrdersFromFile()
    
    if (!order.createdAt) {
      order.createdAt = new Date().toISOString()
    }
    
    orders.push(order)
    writeOrdersToFile(orders)

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('[Orders] POST error:', error)
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, updates } = await req.json()

    let orders = readOrdersFromFile()
    const index = orders.findIndex((o: any) => o.id === id)

    if (index === -1) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    orders[index] = { ...orders[index], ...updates }
    writeOrdersToFile(orders)

    return NextResponse.json({ order: orders[index] })
  } catch (error) {
    console.error('[Orders] PATCH error:', error)
    return NextResponse.json({ message: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()

    let orders = readOrdersFromFile()
    orders = orders.filter((o: any) => o.id !== id)
    writeOrdersToFile(orders)

    return NextResponse.json({ message: 'Order deleted' })
  } catch (error) {
    console.error('[Orders] DELETE error:', error)
    return NextResponse.json({ message: 'Failed to delete order' }, { status: 500 })
  }
}
