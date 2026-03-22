import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getMongoClient } from '@/lib/mongodb'

export const revalidate = 0

export async function GET() {
  try {
    const dataDir = join(process.cwd(), 'public')

    // Fetch stats
    let stats = {
      totalOrders: 0,
      totalRevenue: 0,
      activeOrders: 0,
      tableOccupancy: 0,
    }

    try {
      const client = await getMongoClient()
      const db = client.db('restaurant')

      // Get total orders
      const orders = await db.collection('orders').find({}).toArray()
      const statsCollection = await db
        .collection('stats')
        .findOne({ type: 'daily' })

      stats.totalOrders = orders.length
      stats.activeOrders = orders.filter((o: any) => o.status !== 'completed').length
      stats.totalRevenue = statsCollection?.totalRevenue || orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

      // Calculate occupancy
      const tables = await db.collection('tables').find({}).toArray()
      const occupiedTables = tables.filter((t: any) => t.status === 'occupied').length
      stats.tableOccupancy = tables.length > 0 ? Math.round((occupiedTables / tables.length) * 100) : 0
    } catch (dbErr) {
      console.log('[Combined] Database error, using JSON fallback:', dbErr)
      const statsPath = join(dataDir, 'dashboard-stats.json')
      try {
        const data = JSON.parse(readFileSync(statsPath, 'utf-8'))
        stats = data
      } catch {
        // Use defaults
      }
    }

    // Fetch orders (last 30)
    let orders: any[] = []
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant')
      orders = await db
        .collection('orders')
        .find({})
        .sort({ createdAt: -1 })
        .limit(30)
        .toArray()
    } catch (dbErr) {
      console.log('[Combined] Error fetching orders from DB, using JSON:', dbErr)
      const ordersPath = join(dataDir, 'orders.json')
      try {
        const data = JSON.parse(readFileSync(ordersPath, 'utf-8'))
        orders = (data.orders || []).slice(-30)
      } catch {
        orders = []
      }
    }

    // Format response
    const recentOrders = orders.slice(0, 5).map((order: any) => ({
      id: order._id?.toString() || order.id || '',
      tableNumber: order.tableNumber,
      customerName: order.customerName,
      total: order.total || 0,
      subtotal: order.subtotal,
      status: order.status || 'pending',
      createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
    }))

    return NextResponse.json({
      stats,
      recentOrders,
    })
  } catch (error: any) {
    console.error('[Combined] Error:', error)
    return NextResponse.json(
      {
        stats: {
          totalOrders: 0,
          totalRevenue: 0,
          activeOrders: 0,
          tableOccupancy: 0,
        },
        recentOrders: [],
      },
      { status: 200 }
    )
  }
}
