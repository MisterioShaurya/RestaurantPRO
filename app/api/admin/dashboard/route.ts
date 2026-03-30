import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getServerSession } from '@/lib/auth'
import { jwtDecode } from 'jwt-decode'

export async function GET(req: NextRequest) {
  try {
    let session = await getServerSession()
    
    // If no session from cookies, check Authorization header
    if (!session) {
      const authHeader = req.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          const decoded = jwtDecode(token) as any
          if (decoded && decoded.isAdmin) {
            session = decoded
          }
        } catch (e) {
          console.error('[Admin] Token decode error:', e)
        }
      }
    }
    
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    // Get all collections data
    const [users, subscriptions, orders, menuItems, tables, reservations, inventory] = await Promise.all([
      db.collection('users').find({}).toArray(),
      db.collection('subscriptions').find({}).toArray(),
      db.collection('orders').find({}).toArray(),
      db.collection('menu').find({}).toArray(),
      db.collection('tables').find({}).toArray(),
      db.collection('reservations').find({}).toArray(),
      db.collection('inventory').find({}).toArray()
    ])

    // Calculate statistics
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.isActive !== false).length
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length

    // Get recent activity
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10)

    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10)

    return NextResponse.json({
      statistics: {
        totalUsers,
        activeUsers,
        totalOrders,
        totalRevenue,
        activeSubscriptions,
        totalMenuItems: menuItems.length,
        totalTables: tables.length,
        totalReservations: reservations.length,
        totalInventoryItems: inventory.length
      },
      recentOrders,
      recentUsers,
      allUsers: users.map(u => ({
        ...u,
        password: undefined // Don't send passwords
      })),
      allSubscriptions: subscriptions,
      allOrders: orders,
      allMenuItems: menuItems,
      allTables: tables,
      allReservations: reservations,
      allInventory: inventory
    })
  } catch (error) {
    console.error('[Admin] Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}