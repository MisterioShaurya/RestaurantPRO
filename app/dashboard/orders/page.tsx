'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { localOrderManager, LocalOrder } from '@/lib/local-order-manager'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<LocalOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<LocalOrder | null>(null)

  const deleteOrder = (orderId: string) => {
    if (!confirm('Delete this order?')) return
    localOrderManager.deleteOrder(orderId)
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
    setSelectedOrder(null)
  }

  const loadOrders = async () => {
    try {
      // Fetch from database
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        const dbOrders = data.orders || []
        // Sort by newest first
        const sorted = [...dbOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setOrders(sorted)
      }
    } catch (err) {
      console.log('Error fetching orders from database:', err)
      // Fallback to localStorage
      const allOrders = localOrderManager.getAllOrders()
      const sorted = [...allOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setOrders(sorted)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])


  const exportToExcel = () => {
    const dataToExport = filteredOrders.map(order => ({
      'Order #': order.number,
      'Table': order.tableNumber ? `Table ${order.tableNumber}` : 'Walk-in',
      'Items': order.items.map(item => `${item.name} (${item.qty}x)`).join(', '),
      'Total': order.total.toFixed(2),
      'Status': order.status.toUpperCase(),
      'Time': new Date(order.createdAt).toLocaleString(),
      'Customer': order.customerName || 'N/A'
    }))

    // Convert to CSV
    const headers = Object.keys(dataToExport[0])
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value
        }).join(',')
      )
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredOrders =
    filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-md text-sm font-semibold text-slate-800 dark:text-white"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">📋 All Orders</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">View and manage all restaurant orders</p>
          </div>
        </div>
        <button
          onClick={exportToExcel}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-md flex items-center gap-2"
        >
          📥 Export to Excel
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-4">
        {['all', 'pending', 'preparing', 'ready', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-6 py-3 font-bold rounded-lg whitespace-nowrap capitalize transition shadow-md ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:border-blue-500'
            }`}
          >
            {status === 'all'
              ? '📊 All'
              : status === 'pending'
              ? '⏳ Pending'
              : status === 'preparing'
              ? '🍳 Preparing'
              : status === 'ready'
              ? '✓ Ready'
              : '✓ Completed'}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-600 dark:text-slate-300">
          <p className="text-lg font-semibold">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-slate-600 dark:text-slate-300">
          <p className="text-lg font-semibold">No orders found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-700 border-b-2 border-slate-300 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Order #</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Table</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">#{order.number}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{order.tableNumber ? `T${order.tableNumber}` : 'Walk-in'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
                            : order.status === 'preparing'
                            ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100'
                            : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100'
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded text-xs transition shadow-md"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded text-xs transition shadow-md"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-700">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Order #{selectedOrder.number}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-2xl font-bold">
                ✕
              </button>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Table</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedOrder.tableNumber ? `Table ${selectedOrder.tableNumber}` : 'Walk-in'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Status</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1 capitalize">{selectedOrder.status}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 dark:text-white">Item</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-slate-900 dark:text-white">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-white">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-white">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {selectedOrder.items.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">{it.name}</td>
                      <td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-300">{it.qty}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-300">${it.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-white">${(it.price * it.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border-2 border-slate-300 dark:border-slate-700 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-slate-900 dark:text-white">Total:</span>
                <span className="text-emerald-600 dark:text-emerald-400">${selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => deleteOrder(selectedOrder.id)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition shadow-md"
              >
                🗑️ Delete
              </button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 px-4 py-3 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-lg transition shadow-md">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
