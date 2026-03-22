'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOfflineMode } from '@/hooks/use-offline-mode'

interface Stats {
  totalOrders: number
  totalRevenue: number
  activeOrders: number
  tableOccupancy: number
}

interface Order {
  id: string
  tableNumber?: number
  customerName?: string
  total: number
  subtotal?: number
  status: 'pending' | 'preparing' | 'ready' | 'completed'
  createdAt: string
}

export default function DashboardHome({ user }: { user: any }) {
  const router = useRouter()
  const offlineMode = useOfflineMode()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    tableOccupancy: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Get role from cookie
  useEffect(() => {
    const role = document.cookie
      .split('; ')
      .find(row => row.startsWith('userRole='))
      ?.split('=')[1]
    setUserRole(role || 'admin')
  }, [])

  // Fetch combined stats and orders on mount and periodically
  useEffect(() => {
    if (userRole !== 'admin') return

    const fetchCombined = async () => {
      try {
        const res = await fetch('/api/dashboard/combined')
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setRecentOrders(data.recentOrders.reverse())
          offlineMode.setDatabaseConnected(true)
        } else {
          offlineMode.setDatabaseConnected(false)
        }
      } catch (err) {
        console.log('[Dashboard] Error fetching combined data:', err)
        offlineMode.setDatabaseConnected(false)
      } finally {
        setLoading(false)
      }
    }

    fetchCombined()
    // Refresh every 5 seconds (single combined request instead of 2 separate ones)
    const interval = setInterval(fetchCombined, 5000)
    return () => clearInterval(interval)
  }, [userRole, offlineMode])

  // Redirect counter role to tables page
  useEffect(() => {
    if (userRole === 'counter') {
      router.push('/dashboard/tables')
    }
  }, [userRole, router])

  // Chef view - show only kitchen-related items
  if (userRole === 'chef') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">👨‍🍳 Welcome, {user?.name || 'Chef'}!</h1>
          <p className="text-lg text-gray-600">Kitchen operations and order management</p>
        </div>

        {/* Kitchen Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => router.push('/dashboard/kitchen')}
            className="group relative overflow-hidden bg-white rounded-2xl p-8 card-shadow hover:card-shadow-hover transition-all duration-300 hover:translate-y-[-4px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative text-center">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🔥</div>
              <p className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Kitchen Display</p>
              <p className="text-gray-600 group-hover:text-gray-700">View incoming orders and manage queue</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/order-logs')}
            className="group relative overflow-hidden bg-white rounded-2xl p-8 card-shadow hover:card-shadow-hover transition-all duration-300 hover:translate-y-[-4px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative text-center">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🧾</div>
              <p className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">KOT Logs</p>
              <p className="text-gray-600 group-hover:text-gray-700">View past orders and history</p>
            </div>
          </button>
        </div>

        {/* Chef Info Banner */}
        <div className="bg-gradient-to-r from-orange-100 to-amber-100 border-l-4 border-orange-500 rounded-lg p-6">
          <p className="text-sm font-semibold text-orange-900">🔔 Kitchen Role Active</p>
          <p className="text-sm text-orange-800 mt-2">You have access to kitchen-specific features. New orders appear automatically in the Kitchen Display.</p>
        </div>
      </div>
    )
  }

  // Counter/POS view - return null while redirecting
  if (userRole === 'counter') {
    return null
  }

  // Admin view - show all
  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: '📋', color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-50' },
    { label: 'Revenue Today', value: `$${stats.totalRevenue}`, icon: '💵', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
    { label: 'Active Orders', value: stats.activeOrders, icon: '⏱️', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Table Occupancy', value: `${stats.tableOccupancy}%`, icon: '🍽️', color: 'from-rose-500 to-rose-600', bgColor: 'bg-rose-50' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-50 p-4 sm:p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-10 animate-slide-up">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">👋 Welcome back, {user?.name || 'Admin'}!</h1>
        <p className="text-lg text-gray-600">Here's what's happening at your restaurant today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="group animate-slide-up bg-white rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 hover:translate-y-[-4px] cursor-pointer"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={`${card.bgColor} rounded-xl p-3 w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <div className="text-3xl">{card.icon}</div>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : card.value}</p>
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`bg-gradient-to-r ${card.color} h-full rounded-full w-2/3 transition-all duration-500`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: '🍽️', title: 'Manage Tables', desc: 'View floor & table status', action: 'tables', color: 'green' },
            { icon: '📅', title: 'Reservations', desc: 'Check bookings & waitlist', action: 'reservations', color: 'orange' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => router.push(`/dashboard/${action.action}`)}
              className="group animate-slide-up relative overflow-hidden bg-white rounded-2xl p-8 card-shadow hover:card-shadow-hover transition-all duration-300 hover:translate-y-[-4px] text-left"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-${action.color}-50 to-${action.color}-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">{action.icon}</div>
                <p className="font-bold text-lg text-gray-900 mb-1 group-hover:text-${action.color}-600 transition-colors">{action.title}</p>
                <p className="text-sm text-gray-600 group-hover:text-gray-700">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl card-shadow p-8 overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">📋 Recent Orders</h2>
          <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200">
            View All
          </button>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500 text-lg">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Table</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{order.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.tableNumber ? `Table ${order.tableNumber}` : order.customerName || 'Walk-in'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 font-semibold rounded-full text-xs ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'completed' ? '✓ Completed' :
                         order.status === 'ready' ? '🟢 Ready' :
                         order.status === 'preparing' ? '⏳ Preparing' :
                         '⏸️ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
