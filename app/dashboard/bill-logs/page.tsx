'use client'

import { useEffect, useState } from 'react'
import { Search, Download, Eye, Filter, X } from 'lucide-react'

interface BillItem {
  _id: string
  name: string
  price: number
  qty: number
}

interface Bill {
  _id: string
  tableNumber: number | null
  items: BillItem[]
  subtotal: number
  discount: number
  tax: number
  roundOff: number
  total: number
  paymentMode: string
  status: string
  createdAt: string
}

export default function BillLogsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('')
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/billing')
      if (res.ok) {
        const data = await res.json()
        // Sort by most recent first
        const sortedBills = (data.bills || []).sort((a: Bill, b: Bill) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        setBills(sortedBills)
      }
    } catch (err) {
      console.log('Error fetching bills:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`
  }

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      searchQuery === '' ||
      bill._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bill.tableNumber && bill.tableNumber.toString().includes(searchQuery))

    const matchesPaymentMode =
      selectedPaymentMode === '' || bill.paymentMode === selectedPaymentMode

    const matchesDate =
      dateFilter === '' ||
      new Date(bill.createdAt).toDateString() === new Date(dateFilter).toDateString()

    return matchesSearch && matchesPaymentMode && matchesDate
  })

  const stats = {
    totalBills: bills.length,
    totalRevenue: bills.reduce((sum, bill) => sum + bill.total, 0),
    averageBill: bills.length > 0 ? bills.reduce((sum, bill) => sum + bill.total, 0) / bills.length : 0,
    totalDiscount: bills.reduce((sum, bill) => sum + bill.discount, 0),
  }

  return (
    <>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-800 to-slate-700 border-b border-slate-700 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">Bill Logs</h1>
            <p className="text-slate-400">View and manage all billing transactions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Total Bills</p>
            <p className="text-3xl font-bold text-white">{stats.totalBills}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-emerald-400">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Average Bill</p>
            <p className="text-3xl font-bold text-blue-400">
              {formatCurrency(stats.averageBill)}
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Total Discount</p>
            <p className="text-3xl font-bold text-orange-400">
              {formatCurrency(stats.totalDiscount)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Search Bill ID / Table
                </label>
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded border border-slate-600">
                  <Search size={18} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-700 text-white outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Payment Mode Filter */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Payment Mode
                </label>
                <select
                  value={selectedPaymentMode}
                  onChange={(e) => setSelectedPaymentMode(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-emerald-500 outline-none"
                >
                  <option value="">All Modes</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Reset Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedPaymentMode('')
                    setDateFilter('')
                  }}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded border border-slate-600 transition"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bills Table */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {loading ? (
            <div className="text-center text-slate-400 py-12">Loading bills...</div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <p className="text-lg">No bills found</p>
              {bills.length === 0 ? (
                <p className="text-sm mt-2">No billing data yet. Start taking orders!</p>
              ) : (
                <p className="text-sm mt-2">Try adjusting your filters</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBills.map((bill) => (
                <div
                  key={bill._id}
                  className="bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition"
                >
                  {/* Bill Header */}
                  <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-white font-semibold">
                            Bill ID: <span className="text-emerald-400">{bill._id.slice(-8)}</span>
                          </p>
                          <p className="text-slate-400 text-sm mt-1">
                            {formatDate(bill.createdAt)}
                          </p>
                        </div>
                        <div className="h-12 w-px bg-slate-700" />
                        <div>
                          <p className="text-slate-300 text-sm">
                            {bill.tableNumber ? `Table ${bill.tableNumber}` : 'Walk-in Customer'}
                          </p>
                          <p className="text-slate-400 text-xs mt-1">
                            Items: {bill.items.reduce((sum, item) => sum + item.qty, 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right mr-4">
                      <p className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(bill.total)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 capitalize">
                        {bill.paymentMode}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBill(bill)
                          setShowDetails(true)
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded transition flex items-center gap-2"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          const billContent = `
BILL DETAILS
========================
Bill ID: ${bill._id}
Date: ${formatDate(bill.createdAt)}
Table: ${bill.tableNumber ? `Table ${bill.tableNumber}` : 'Walk-in'}
Payment: ${bill.paymentMode.toUpperCase()}

ITEMS:
${bill.items.map((item) => `${item.name} x${item.qty} - ${formatCurrency(item.price * item.qty)}`).join('\n')}

========================
Subtotal: ${formatCurrency(bill.subtotal)}
Discount: -${formatCurrency(bill.discount)}
Tax (10%): ${formatCurrency(bill.tax)}
Round Off: ${formatCurrency(bill.roundOff)}
------------------------
TOTAL: ${formatCurrency(bill.total)}
========================`

                          const printWindow = window.open('', '', 'height=600,width=500')
                          if (printWindow) {
                            printWindow.document.write('<pre style="font-family: monospace; font-size: 12px;">')
                            printWindow.document.write(billContent)
                            printWindow.document.write('</pre>')
                            printWindow.document.close()
                            printWindow.print()
                          }
                        }}
                        className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded transition flex items-center gap-2"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Quick Summary */}
                  <div className="p-4 grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Subtotal</p>
                      <p className="text-white font-semibold">
                        {formatCurrency(bill.subtotal)}
                      </p>
                    </div>
                    {bill.discount > 0 && (
                      <div>
                        <p className="text-slate-400">Discount</p>
                        <p className="text-orange-400 font-semibold">
                          -{formatCurrency(bill.discount)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-400">Tax</p>
                      <p className="text-blue-400 font-semibold">{formatCurrency(bill.tax)}</p>
                    </div>
                    {bill.roundOff !== 0 && (
                      <div>
                        <p className="text-slate-400">Round Off</p>
                        <p className={`font-semibold ${bill.roundOff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {bill.roundOff > 0 ? '+' : ''}{formatCurrency(bill.roundOff)}
                        </p>
                      </div>
                    )}
                    <div className="border-l border-slate-700 pl-4">
                      <p className="text-slate-400">Total</p>
                      <p className="text-emerald-400 font-bold text-lg">
                        {formatCurrency(bill.total)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bill Details Modal */}
      {showDetails && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700 overflow-hidden max-h-96 flex flex-col">
            {/* Header */}
            <div className="bg-linear-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Bill Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Bill Info */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bill ID:</span>
                  <span className="text-white font-semibold">{selectedBill._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span className="text-white font-semibold">
                    {formatDate(selectedBill.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Table:</span>
                  <span className="text-white font-semibold">
                    {selectedBill.tableNumber ? `Table ${selectedBill.tableNumber}` : 'Walk-in'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Mode:</span>
                  <span className="text-white font-semibold capitalize">
                    {selectedBill.paymentMode}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-white font-semibold mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedBill.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-300">
                        {item.name} x{item.qty}
                      </span>
                      <span className="text-white">
                        {formatCurrency(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-slate-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Subtotal:</span>
                  <span className="text-white">{formatCurrency(selectedBill.subtotal)}</span>
                </div>
                {selectedBill.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-400">Discount:</span>
                    <span className="text-orange-400">
                      -{formatCurrency(selectedBill.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Tax (10%):</span>
                  <span className="text-white">{formatCurrency(selectedBill.tax)}</span>
                </div>
                {selectedBill.roundOff !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className={selectedBill.roundOff > 0 ? 'text-red-400' : 'text-emerald-400'}>
                      Round Off:
                    </span>
                    <span className={selectedBill.roundOff > 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {selectedBill.roundOff > 0 ? '+' : ''}{formatCurrency(selectedBill.roundOff)}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-700 pt-2 flex justify-between">
                  <span className="text-white font-bold">TOTAL:</span>
                  <span className="text-emerald-400 font-bold text-lg">
                    {formatCurrency(selectedBill.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-700 px-6 py-4 border-t border-slate-700">
              <button
                onClick={() => setShowDetails(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
