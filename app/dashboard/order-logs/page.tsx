'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChefHat, Printer } from 'lucide-react'

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
}

export default function OrderLogsPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTable, setFilterTable] = useState<number | string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
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
          isDone: o.isDone || false,
        }))
        setOrders(fetchedOrders)
        setLoading(false)
        return
      }
    } catch (err) {
      console.log('API fetch failed:', err)
    }
    
    // Fallback to localStorage
    try {
      const savedLogs = localStorage.getItem('kotLogs')
      if (savedLogs) {
        setOrders(JSON.parse(savedLogs))
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err)
    }
    setLoading(false)
  }

  const filteredOrders = orders.filter(order => {
    const matchTable = filterTable === 'all' ? true
      : filterTable === 'walk-in' ? order.tableNumber === null || order.tableNumber === undefined
      : order.tableNumber === parseInt(filterTable as string)
    
    const matchSearch = searchTerm === '' ? true
      : order.items?.some(item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchTable && matchSearch
  })

  const isOrderCancelled = (order: Order) => 
    order.status === 'cancelled' || order.items?.some(item => item._id === 'cancelled')

  const getCancelledItems = (order: Order) =>
    order.items?.filter(item => item._id !== 'cancelled') || []

  const toggleOrderDone = (orderId: string) => {
    setOrders(logs =>
      logs.map(order =>
        order.id === orderId ? { ...order, isDone: !order.isDone } : order
      )
    )
    const updated = orders.map(order =>
      order.id === orderId ? { ...order, isDone: !order.isDone } : order
    )
    localStorage.setItem('kotLogs', JSON.stringify(updated))
  }

  const uniqueTables = [...new Set(orders
    .filter(order => order.tableNumber !== null && order.tableNumber !== undefined)
    .map(order => order.tableNumber)
    .sort((a, b) => (a || 0) - (b || 0))
  )]

  const getPaymentModeIcon = (mode?: string) => {
    switch (mode) {
      case 'cash': return '💵 Cash';
      case 'card': return '💳 Card';
      case 'upi': return '📱 UPI';
      case 'split': return '🔀 Split';
      default: return '—';
    }
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
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <ChefHat size={32} className="text-orange-500" />
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Order Logs</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">All orders with dates & payment modes</p>
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
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Total Orders</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{orders.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Table Orders</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {orders.filter(l => l.tableNumber !== null && l.tableNumber !== undefined).length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Walk-in</p>
            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
              {orders.filter(l => l.tableNumber === null || l.tableNumber === undefined).length}
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
            <p className="text-slate-600 dark:text-slate-400 text-lg">Loading order logs...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <ChefHat size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold">No orders found</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}

        {/* Orders */}
        {!loading && filteredOrders.length > 0 && (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id || order._id}
                className={`border-2 rounded-lg p-6 transition ${
                  isOrderCancelled(order)
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {order.tableNumber ? `🪑 Table ${order.tableNumber}` : '💼 Walk-in'}
                      </h3>
                      <span className="text-xs bg-orange-600 dark:bg-orange-700 text-white px-3 py-1.5 rounded-full font-bold">
                        KOT #{order.kotCount || 1}
                      </span>
                      {isOrderCancelled(order) && (
                        <span className="text-xs bg-red-600 dark:bg-red-700 text-white px-3 py-1.5 rounded-full font-bold">🚫 CANCELLED</span>
                      )}
                      {order.isDone && (
                        <span className="text-xs bg-emerald-600 dark:bg-emerald-700 text-white px-3 py-1.5 rounded-full font-bold">✓ PREPARED</span>
                      )}
                    </div>
                    {/* Date & Payment Mode Row */}
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
                  <div className="ml-4 flex items-center gap-2">
                    <button
                      onClick={() => toggleOrderDone(order.id || order._id)}
                      className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                        order.isDone
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {order.isDone ? '✓ Done' : 'Mark Done'}
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className={`rounded-lg p-4 mb-4 ${isOrderCancelled(order) ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-50 dark:bg-slate-900/50'}`}>
                  {isOrderCancelled(order) && (
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
                  {!isOrderCancelled(order) && (!order.items || order.items.length === 0) && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">No items</p>
                  )}
                </div>

                {/* Summary */}
                {getCancelledItems(order).length > 0 && !isOrderCancelled(order) && (
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white">Total Items:</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">
                      {getCancelledItems(order).reduce((sum, item) => sum + (item.qty || 0), 0)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}