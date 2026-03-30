'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChefHat, Printer, CheckCircle2, Circle } from 'lucide-react'

interface OrderItem {
  _id: string
  name: string
  price: number
  qty: number
}

interface KOTLog {
  id: string
  kotNumber: number
  tableNumber: number | null
  items: OrderItem[]
  timestamp: string
  kotCount: number
  isDone?: boolean
}

export default function OrderLogsPage() {
  const router = useRouter()
  const [kotLogs, setKotLogs] = useState<KOTLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTable, setFilterTable] = useState<number | string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchKOTLogs()
  }, [])

  const fetchKOTLogs = async () => {
    try {
      // Try to fetch from API if available, otherwise use localStorage
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data = await res.json()
          // Transform API response if needed
          setKotLogs(data.orders || [])
          setLoading(false)
          return
        }
      } catch (err) {
        console.log('API fetch failed, trying localStorage')
      }
      
      // Fallback to localStorage
      const savedLogs = localStorage.getItem('kotLogs')
      if (savedLogs) {
        setKotLogs(JSON.parse(savedLogs))
      }
      setLoading(false)
    } catch (err) {
      console.error('Error fetching KOT logs:', err)
      setLoading(false)
    }
  }

  const filteredLogs = kotLogs.filter(log => {
    const matchTable = filterTable === 'all' 
      ? true
      : filterTable === 'walk-in' 
      ? log.tableNumber === null 
      : log.tableNumber === parseInt(filterTable as string)
    
    const matchSearch = searchTerm === '' 
      ? true 
      : log.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchTable && matchSearch
  })

  const isOrderCancelled = (log: KOTLog) => 
    log.items.some(item => item._id === 'cancelled')

  const getCancelledItems = (log: KOTLog) =>
    log.items.filter(item => item._id !== 'cancelled')

  const toggleOrderDone = (orderId: string) => {
    setKotLogs(logs =>
      logs.map(log =>
        log.id === orderId ? { ...log, isDone: !log.isDone } : log
      )
    )
    // Save to localStorage
    const updated = kotLogs.map(log =>
      log.id === orderId ? { ...log, isDone: !log.isDone } : log
    )
    localStorage.setItem('kotLogs', JSON.stringify(updated))
  }

  // Get unique table numbers from logs
  const uniqueTables = [...new Set(kotLogs
    .filter(log => log.tableNumber !== null)
    .map(log => log.tableNumber)
    .sort((a, b) => (a || 0) - (b || 0))
  )]

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
                <p className="text-slate-600 dark:text-slate-300 mt-1">Kitchen Order Tickets (KOT)</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={fetchKOTLogs}
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
              <option key={num} value={num}>
                Table {num}
              </option>
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
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Total Orders</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{kotLogs.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Table Orders</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {kotLogs.filter(l => l.tableNumber !== null).length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Walk-in Orders</p>
            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
              {kotLogs.filter(l => l.tableNumber === null).length}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 dark:border-slate-600 border-t-blue-600"></div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Loading order logs...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredLogs.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <ChefHat size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold">No kitchen orders found</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}

        {/* KOT Logs Grid */}
        {!loading && filteredLogs.length > 0 && (
          <div className="grid gap-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`border-2 rounded-lg p-6 transition ${
                  isOrderCancelled(log)
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {log.tableNumber ? `🪑 Table ${log.tableNumber}` : '💼 Walk-in Order'}
                      </h3>
                      <span className="text-xs bg-orange-600 dark:bg-orange-700 text-white px-3 py-1.5 rounded-full font-bold">
                        KOT #{log.kotCount || 1}
                      </span>
                      {isOrderCancelled(log) && (
                        <span className="text-xs bg-red-600 dark:bg-red-700 text-white px-3 py-1.5 rounded-full font-bold">
                          🚫 CANCELLED
                        </span>
                      )}
                      {log.isDone && (
                        <span className="text-xs bg-emerald-600 dark:bg-emerald-700 text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
                          ✓ PREPARED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'medium'
                      })}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition flex items-center gap-2 whitespace-nowrap">
                      <Printer size={18} />
                      Print
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className={`rounded-lg p-4 mb-4 ${isOrderCancelled(log) ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-50 dark:bg-slate-900/50'}`}>
                  {isOrderCancelled(log) && (
                    <div className="text-red-700 dark:text-red-400 font-bold mb-3 text-center text-lg">
                      ⚠️ ORDER CANCELLED ⚠️
                    </div>
                  )}
                  {getCancelledItems(log).length > 0 && (
                    <div className="space-y-2">
                      {getCancelledItems(log).map((item, idx) => (
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
                  {!isOrderCancelled(log) && log.items.length === 0 && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">No items</p>
                  )}
                </div>

                {/* Summary */}
                {getCancelledItems(log).length > 0 && !isOrderCancelled(log) && (
                  <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white">Total Items:</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">
                      {getCancelledItems(log).reduce((sum, item) => sum + item.qty, 0)}
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
