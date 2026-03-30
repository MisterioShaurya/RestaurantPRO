import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import fs from 'fs'
import path from 'path'

const STATS_FILE_PATH = path.join(process.cwd(), 'dashboard-stats.json')
const ORDERS_FILE_PATH = path.join(process.cwd(), 'orders.json')
const TABLES_FILE_PATH = path.join(process.cwd(), 'tables.json')

function readStatsFromFile() {
  try {
    const data = fs.readFileSync(STATS_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('[Stats] Error reading dashboard-stats.json:', error)
    return { totalOrders: 0, totalRevenue: 0, activeOrders: 0, tableOccupancy: 0 }
  }
}

function readOrdersFromFile() {
  try {
    const data = fs.readFileSync(ORDERS_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('[Stats] Error reading orders.json:', error)
    return []
  }
}

function readTablesFromFile() {
  try {
    const data = fs.readFileSync(TABLES_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('[Stats] Error reading tables.json:', error)
    return []
  }
}

function writeStatsToFile(stats: any) {
  try {
    fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(stats, null, 2))
  } catch (error) {
    console.error('[Stats] Error writing dashboard-stats.json:', error)
  }
}

function calculateStatsFromLocalData() {
  const orders = readOrdersFromFile()
  const tables = readTablesFromFile()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Calculate stats from local orders
  const todaysOrders = orders.filter((o: any) => {
    try {
      const d = o && o.createdAt ? new Date(o.createdAt) : null
      return d ? d >= today : false
    } catch (e) {
      return false
    }
  })

  const totalOrders = todaysOrders.length
  const totalRevenue = todaysOrders.reduce((sum: number, o: any) => sum + (Number(o.total || 0)), 0)
  const activeOrders = todaysOrders.filter((o: any) => o.status !== 'completed').length
  const occupiedTables = tables.filter((t: any) => t.status === 'occupied').length
  const tableOccupancy = tables.length ? Math.round((occupiedTables / tables.length) * 100) : 0

  return {
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    activeOrders,
    tableOccupancy,
  }
}

export async function GET(req: NextRequest) {
  try {
    // Calculate stats from local data first
    let stats = calculateStatsFromLocalData()

    // Try to fetch from database to update stats
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const rawOrders = await db.collection('orders').find().sort({ createdAt: -1 }).limit(1000).toArray()

      const todaysOrders = rawOrders.filter((o: any) => {
        try {
          const d = o && o.createdAt ? new Date(o.createdAt) : null
          return d ? d >= today : false
        } catch (e) {
          return false
        }
      })

      const totalOrders = todaysOrders.length
      const totalRevenue = todaysOrders.reduce((sum: number, o: any) => sum + (Number(o.total || 0)), 0)
      const activeOrders = todaysOrders.filter((o: any) => o.status !== 'completed').length
      const tables = await db.collection('tables').find().toArray()
      const occupiedTables = tables.filter((t: any) => t.status === 'occupied').length
      const tableOccupancy = tables.length ? Math.round((occupiedTables / tables.length) * 100) : 0

      stats = {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        activeOrders,
        tableOccupancy,
      }
      writeStatsToFile(stats)
    } catch (dbError) {
      console.error('[Stats] Database error:', dbError)
      // Use stats calculated from local files
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('[Stats] GET error:', error)
    return NextResponse.json({ totalOrders: 0, totalRevenue: 0, activeOrders: 0, tableOccupancy: 0 }, { status: 500 })
  }
}
