'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChefHat } from 'lucide-react'

interface OrderItem {
  _id: string
  name: string
  price: number
  qty: number
  quantity?: number
}

interface Order {
  _id: string
  id?: string
  kotNumber?: number
  tableNumber?: number | null
  tableId?: string | null
  items: OrderItem[]
  createdAt: string
  timestamp?: string
  kotCount?: number
  isDone?: boolean
  status?: string
  paymentMode?: string
  subtotal?: number
  total?: number
  kotStatus?: 'pending' | 'preparing' | 'done' | 'cancelled'
}

export default function OrderLogsPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTable, setFilterTable] = useState<number | string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [userRole, setUserRole] = useState<string>('admin')
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Get user role on mount and redirect chef to kitchen page
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserRole(user.role || 'admin')
        // Redirect chef users to the dedicated KOT kitchen page
        if (user.role === 'chef') {
          router.replace('/dashboard/kitchen')
          return
        }
      } catch {}
    }
  }, [router])

  const fetchOrders = useCallback(async () => {
    try {
      const [ordersRes, kotsRes] = await Promise.all([
        fetch('/api/orders').catch(() => null),
        fetch('/api/kot').catch(() => null),
      ])

      let allOrders: Order[] = []

      if (ordersRes && ordersRes.ok) {
        const data = await ordersRes.json()
        const fetchedOrders = (data.orders || []).map((o: Order) => ({
          ...o,
          id: o._id || o.id,
          tableNumber: o.tableNumber || (o.tableId ? parseInt(o.tableId.replace(/\D/g, '')) : null) || null,
          items: (o.items || []).map((item: OrderItem) => ({
            ...item,
            qty: item.qty || item.quantity || 1,
          })),
          timestamp: o.createdAt || o.timestamp || new Date().toISOString(),
          kotCount: o.kotCount || 1,
          kotStatus: o.kotStatus || (o.isDone ? 'done' : o.status === 'cancelled' ? 'cancelled' : o.status === 'preparing' ? 'preparing' : o.status === 'completed' ? 'done' : 'pending'),
        }))
        allOrders = [...allOrders, ...fetchedOrders]
      }

      if (kotsRes && kotsRes.ok) {
        const data = await kotsRes.json()
        const kotsList = (data.kots || []).map((k: any) => ({
          ...k,
          id: k._id || k.id,
          tableNumber: k.tableNumber || null,
          items: (k.items || []).map((item: any) => ({
            _id: item._id || '',
            name: item.name || '',
            price: item.price || 0,
            qty: item.quantity || item.qty || 1,
          })),
          timestamp: k.createdAt || new Date().toISOString(),
          kotStatus: k.kotStatus || k.status || 'pending',
          kotCount: k.kotCount || 1,
        }))
        allOrders = [...allOrders, ...kotsList]
      }

      // Deduplicate
      const map = new Map<string, Order>()
      for (const o of allOrders) {
        const key = o._id || o.id || Math.random().toString()
        if (!map.has(key)) {
          map.set(key, o)
        }
      }

      const merged = Array.from(map.values())
        .sort((a, b) => new Date(b.timestamp || b.createdAt || 0).getTime() - new Date(a.timestamp || a.createdAt || 0).getTime())

      setOrders(merged)
      setLoading(false)
    } catch (err) {
      console.log('API fetch failed:', err)
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    if (userRole === 'chef') return // Don't fetch if chef (will redirect)
    fetchOrders()
    pollingRef.current = setInterval(fetchOrders, 3000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [fetchOrders, userRole])

  const filteredOrders = orders.filter(order => {
    const matchTable = filterTable === 'all' ? true
      : filterTable === 'walk-in' ? order.tableNumber === null || order.tableNumber === undefined
      : order.tableNumber === Number(filterTable)
    
    const matchSearch = searchTerm === '' ? true
      : order.items?.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchTable && matchSearch
  })

  const isOrderCancelled = (order: Order) => 
    order.status === 'cancelled' || order.kotStatus === 'cancelled'

  const getCancelledItems = (order: Order) =>
    order.items?.filter(item => item._id !== 'cancelled') || []

  const uniqueTables = [...new Set(orders
    .filter(order => order.tableNumber !== null && order.tableNumber !== undefined)
    .map(order => order.tableNumber)
    .sort((a, b) => (a || 0) - (b || 0))
  )] as number[]

  const getPaymentModeIcon = (mode?: string) => {
    switch (mode) {
      case 'cash': return '💵 Cash';
      case 'card': return '💳 Card';
      case 'upi': return '📱 UPI';
      case 'split': return '🔀 Split';
      default: return '—';
    }
  }

  // If chef somehow lands here before redirect, show minimal UI
  if (userRole === 'chef') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Redirecting to Kitchen Orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-md text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              &larr; Back
            </button>
            <div className="flex items-center gap-3">
              <ChefHat size={32} className="text-orange-500" />
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                  KOT Logs
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  Complete KOT history — all dates (Admin / Cashier only)
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-md"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <select
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none font-semibold"
          >
            <option value="all">All Orders</option>
            <option value="walk-in">Walk-in Orders</option>
            {uniqueTables.map(num => (
              <option key={num} value={num}>Table {num}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Search by item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-none font-semibold flex-1"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Total KOTs</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{orders.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Preparing</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {orders.filter(o => o.kotStatus === 'preparing').length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Done</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {orders.filter(o => o.kotStatus === 'done' || o.isDone).length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Revenue</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 dark:border-slate-600 border-t-blue-600"></div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Loading KOT logs...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <ChefHat size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold">No KOTs found</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}

        {/* KOT Logs - Read Only for admin/cashier */}
        {!loading && filteredOrders.length > 0 && (
          <div className="grid gap-4">
            {filteredOrders.map((order) => {
              const cancelled = isOrderCancelled(order)
              const kotStatus = order.kotStatus || (order.isDone ? 'done' : 'pending')
              return (
              <div
                key={order.id || order._id}
                className={`border-2 rounded-lg p-6 transition ${
                  kotStatus === 'done'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600'
                    : cancelled
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {order.tableNumber ? `🍽️ Table ${order.tableNumber}` : '👥 Walk-in'}
                      </h3>
                      <span className="text-xs bg-orange-600 dark:bg-orange-700 text-white px-3 py-1.5 rounded-full font-bold">
                        KOT #{order.kotCount || 1}
                      </span>
                      {cancelled && (
                        <span className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-full font-bold">🚫 CANCELLED</span>
                      )}
                      {kotStatus === 'preparing' && !cancelled && (
                        <span className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-full font-bold animate-pulse">🔥 PREPARING</span>
                      )}
                      {kotStatus === 'done' && !cancelled && (
                        <span className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full font-bold">✓ DONE</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <p className="text-slate-500 dark:text-slate-400">
                        📅 {new Date(order.timestamp || order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      {order.paymentMode && (
                        <p className="font-semibold text-slate-600 dark:text-slate-300">
                          💳 {getPaymentModeIcon(order.paymentMode)}
                        </p>
                      )}
                      {order.total !== undefined && order.total > 0 && (
                        <p className="font-bold text-emerald-600">₹{order.total.toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {/* NO ACTION BUTTONS - Read only for admin/cashier */}
                </div>

                {/* Items */}
                <div className={`rounded-lg p-4 mb-4 ${
                  kotStatus === 'done' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  cancelled ? 'bg-red-100 dark:bg-red-900/30' : 
                  'bg-slate-50 dark:bg-slate-900/50'
                }`}>
                  {cancelled && (
                    <div className="text-red-700 dark:text-red-400 font-bold mb-3 text-center text-lg">⚠️ ORDER CANCELLED</div>
                  )}
                  {(getCancelledItems(order)?.length || 0) > 0 && (
                    <div className="space-y-2">
                      {getCancelledItems(order).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                          <span className="font-medium text-slate-900 dark:text-slate-100">{item.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600 dark:text-slate-400">x{item.qty}</span>
                            {item.price > 0 && (
                              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                ₹{(item.price * item.qty).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!cancelled && (!order.items || order.items.length === 0) && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">No items</p>
                  )}
                </div>

                {/* Summary */}
                {getCancelledItems(order).length > 0 && !cancelled && (
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white">Total Items:</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">
                      {getCancelledItems(order).reduce((sum, item) => sum + (item.qty || 0), 0)}
                    </span>
                  </div>
                )}
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}