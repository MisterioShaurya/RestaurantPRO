import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getMongoClient } from '@/lib/mongodb'
import { getRestaurantIdFromRequest } from '@/lib/get-restaurant-id'

export const revalidate = 0

export async function GET(req: Request) {
  try {
    const restaurantId = await getRestaurantIdFromRequest(req as any)
    
    if (!restaurantId) {
      return NextResponse.json(
        { stats: { totalOrders: 0, totalRevenue: 0, activeOrders: 0, tableOccupancy: 0 }, recentOrders: [] },
        { status: 200 }
      )
    }

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
      const db = client.db('restaurant_pos')

      // Get total orders FOR THIS RESTAURANT ONLY
      const orders = await db.collection('orders').find({ restaurantId }).toArray()
      const statsCollection = await db
        .collection('stats')
        .findOne({ type: 'daily', restaurantId })

      stats.totalOrders = orders.length
      stats.activeOrders = orders.filter((o: any) => o.status !== 'completed').length
      stats.totalRevenue = statsCollection?.totalRevenue || orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

      // Calculate occupancy FOR THIS RESTAURANT ONLY
      const tables = await db.collection('tables').find({ restaurantId }).toArray()
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

    // Fetch orders (last 30) FOR THIS RESTAURANT ONLY
    let orders: any[] = []
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')
      orders = await db
        .collection('orders')
        .find({ restaurantId })
        .sort({ createdAt: -1 })
        .limit(30)
        .toArray()
    } catch (dbErr) {
      console.log('[Combined] Error fetching orders from DB, using JSON:', dbErr)
      const ordersPath = join(dataDir, 'orders.json')
      try {
        const data = JSON.parse(readFileSync(ordersPath, 'utf-8'))
        orders = (Array.isArray(data) ? data : data.orders || []).slice(-30)
      } catch {
        orders = []
      }
    }

    // Format response with payment status
    const recentOrders = orders.slice(0, 5).map((order: any) => {
      let createdAtStr = new Date().toISOString()
      if (order.createdAt) {
        if (order.createdAt instanceof Date) {
          createdAtStr = order.createdAt.toISOString()
        } else if (typeof order.createdAt === 'string') {
          createdAtStr = order.createdAt
        } else if (order.createdAt.toDate) {
          // MongoDB Timestamp
          createdAtStr = order.createdAt.toDate().toISOString()
        } else if (typeof order.createdAt === 'object' && order.createdAt.$date) {
          // MongoDB extended JSON date format
          createdAtStr = new Date(order.createdAt.$date).toISOString()
        }
      }
      
      // Determine payment status
      const isPaid = order.status === 'completed' || order.paymentStatus === 'paid'
      const displayStatus = isPaid ? 'paid' : 'pending'
      
      return {
        id: order._id?.toString() || order.id || '',
        tableNumber: order.tableNumber,
        customerName: order.customerName,
        total: order.total || 0,
        subtotal: order.subtotal,
        status: displayStatus,
        createdAt: createdAtStr,
      }
    })

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
