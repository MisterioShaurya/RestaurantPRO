'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChefNotifications } from '@/components/chef-notifications'

interface KitchenOrder {
  _id: string
  orderNumber: string
  tableNumber?: number
  items: Array<{ name: string; quantity: number }>
  status: 'pending' | 'preparing' | 'ready' | 'completed'
  createdAt: string
  priority: 'normal' | 'urgent'
}

export default function KitchenPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    // Poll for new orders every 3 seconds
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/kitchen/orders')
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data.orders) ? data.orders : []
        // dedupe by _id and sort by createdAt ascending
        const map = new Map<string, KitchenOrder>()
        for (const o of list) if (o && o._id) map.set(o._id, o)
        const unique = Array.from(map.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        setOrders(unique)
      }
    } catch (err) {
      console.log('Error fetching kitchen orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/kitchen/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        // If marking as completed, remove from this view
        if (status === 'completed') {
          setOrders((prev) => prev.filter((o) => o._id !== orderId))
        } else {
          setOrders((prev) =>
            prev.map((o) => (o._id === orderId ? { ...o, status: status as any } : o))
          )
        }
      }
    } catch (err) {
      console.log('Error updating order:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-l-4 border-red-500 bg-red-50'
      case 'preparing':
        return 'border-l-4 border-orange-500 bg-orange-50'
      case 'ready':
        return 'border-l-4 border-green-500 bg-green-50'
      default:
        return 'border-l-4 border-gray-500 bg-gray-50'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-red-700'
      case 'preparing':
        return 'text-orange-700'
      case 'ready':
        return 'text-green-700'
      default:
        return 'text-gray-700'
    }
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const preparingOrders = orders.filter((o) => o.status === 'preparing')
  const readyOrders = orders.filter((o) => o.status === 'ready')

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-yellow-50 to-orange-50 p-4 sm:p-6 lg:p-8">
      <ChefNotifications />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              🔥 Kitchen Display System
            </h1>
            <p className="text-lg text-gray-600">Real-time order management - All active orders</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition shadow-md active:scale-95"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Status Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 card-shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-600 font-semibold uppercase">Pending</p>
          <p className="text-4xl font-bold text-red-600 mt-2">{pendingOrders.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow border-l-4 border-orange-500">
          <p className="text-sm text-gray-600 font-semibold uppercase">Preparing</p>
          <p className="text-4xl font-bold text-orange-600 mt-2">{preparingOrders.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-600 font-semibold uppercase">Ready</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{readyOrders.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-600 text-lg">Loading kitchen orders...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Orders */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-red-700 flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-red-500"></span>
              Pending Orders
            </h2>
            <div className="space-y-4">
              {pendingOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl card-shadow">No pending orders</div>
              ) : (
                pendingOrders.map((order) => (
                  <div
                    key={order._id}
                    className={`p-6 rounded-2xl card-shadow hover:card-shadow-hover transition-all duration-200 ${getStatusColor(order.status)}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">#{order.orderNumber}</p>
                        {order.tableNumber && (
                          <p className="text-sm text-gray-600 mt-1">🍽️ Table {order.tableNumber}</p>
                        )}
                      </div>
                      {order.priority === 'urgent' && (
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg animate-pulse">🚨 URGENT</span>
                      )}
                    </div>
                    <div className="space-y-2 mb-4 bg-white/60 p-4 rounded-lg">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-gray-900">
                          <span className="font-medium">{item.name}</span>
                          <span className="font-bold text-red-600 bg-red-100 px-3 py-1 rounded-lg">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => updateOrderStatus(order._id, 'preparing')}
                      className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition shadow-md active:scale-95 hover:shadow-lg"
                    >
                      🍳 Start Preparing
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Preparing Orders */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-orange-700 flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-orange-500"></span>
              Preparing Orders
            </h2>
            <div className="space-y-4">
              {preparingOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl card-shadow">No orders being prepared</div>
              ) : (
                preparingOrders.map((order) => (
                  <div
                    key={order._id}
                    className={`p-5 rounded-lg shadow-md transition hover:shadow-lg ${getStatusColor(order.status)}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">#{order.orderNumber}</p>
                        {order.tableNumber && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">Table {order.tableNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 bg-white/50 dark:bg-slate-800/50 p-3 rounded">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-slate-900 dark:text-white">
                          <span className="font-medium">{item.name}</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => updateOrderStatus(order._id, 'ready')}
                      className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition shadow-md active:scale-95 hover:shadow-lg"
                    >
                      ✓ Mark Ready
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ready Orders */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-green-700 flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-green-500"></span>
              Ready for Pickup
            </h2>
            <div className="space-y-4">
              {readyOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl card-shadow">No orders ready</div>
              ) : (
                readyOrders.map((order) => (
                  <div
                    key={order._id}
                    className={`p-6 rounded-2xl card-shadow hover:card-shadow-hover transition-all duration-200 ${getStatusColor(order.status)}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">#{order.orderNumber}</p>
                        {order.tableNumber && (
                          <p className="text-sm text-gray-600 mt-1">🍽️ Table {order.tableNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 bg-white/60 p-4 rounded-lg">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-gray-900">
                          <span className="font-medium">{item.name}</span>
                          <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-lg">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => updateOrderStatus(order._id, 'completed')}
                      className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition shadow-md active:scale-95 hover:shadow-lg"
                    >
                      ✅ Order Completed
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
