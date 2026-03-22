'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface BillingItem {
  foodItemId: string
  name: string
  price: number
  quantity: number
  total: number
}

interface Bill {
  _id: string
  billNumber: string
  tableNumber?: number
  customerName?: string
  customerPhone?: string
  items: BillingItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'pending' | 'paid' | 'cancelled'
  createdAt: string
  paymentMethod?: string
  paymentMode?: string
}

export default function BillingPage() {
  const router = useRouter()
  const [bills, setBills] = useState<Bill[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewBill, setShowNewBill] = useState(false)
  const [cartItems, setCartItems] = useState<BillingItem[]>([])
  const [tableNumber, setTableNumber] = useState<number | null>(null)
  const [taxRate, setTaxRate] = useState(0.1)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'upi' | 'cheque'>('cash')
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    fetchBills()
    fetchMenuItems()
  }, [])

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/billing')
      if (res.ok) {
        const data = await res.json()
        setBills(data.bills || [])
      }
    } catch (err) {
      console.log(' Error fetching bills:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/menu')
      if (res.ok) {
        const data = await res.json()
        setMenuItems(data.items || [])
      }
    } catch (err) {
      console.log(' Error fetching menu:', err)
    }
  }

  const addItemToCart = (item: any) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.foodItemId === item._id)
      if (existing) {
        return prev.map((i) =>
          i.foodItemId === item._id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
            : i
        )
      }
      return [
        ...prev,
        {
          foodItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
          total: item.price,
        },
      ]
    })
  }

  const removeFromCart = (foodItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.foodItemId !== foodItemId))
  }

  const updateQuantity = (foodItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodItemId)
    } else {
      setCartItems((prev) =>
        prev.map((i) =>
          i.foodItemId === foodItemId
            ? { ...i, quantity, total: quantity * i.price }
            : i
        )
      )
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0)
  const discount = subtotal * (discountPercent / 100)
  const taxableAmount = subtotal - discount
  const tax = taxableAmount * taxRate
  const total = taxableAmount + tax

  const handleCreateBill = async () => {
    if (cartItems.length === 0) {
      alert('Add items to create a bill')
      return
    }

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          items: cartItems,
          subtotal,
          tax,
          discount,
          total,
          taxRate,
          discountPercent,
          paymentMode,
          customerName,
          customerPhone: '', // Add phone if needed
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setBills([data.bill, ...bills])
        setCartItems([])
        setTableNumber(null)
        setCustomerName('')
        setTaxRate(0.1)
        setDiscountPercent(0)
        setPaymentMode('cash')
        setShowNewBill(false)
        alert(`✓ Bill created and marked as PAID: ${data.bill.billNumber}`)
      }
    } catch (err) {
      console.log(' Error creating bill:', err)
      alert('Error creating bill')
    }
  }

  const sendToKOT = async () => {
    if (cartItems.length === 0) return alert('Add items before sending to kitchen')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName || null,
          tableNumber,
          items: cartItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          subtotal,
          discount: 0,
          tax,
          total,
          status: 'confirmed',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        alert(`✓ Sent to kitchen (Order #${data.order.orderNumber})`)
      } else {
        alert('Failed to send to kitchen')
      }
    } catch (err) {
      console.log(' Error sending to KOT', err)
      alert('Failed to send to kitchen')
    }
  }

  const printInvoice = () => {
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
          .total { font-weight: bold; font-size: 16px; }
        </style>
      </head>
      <body>
        <h1>INVOICE</h1>
        <p><strong>Customer:</strong> ${customerName || 'Walk-in'}</p>
        <p><strong>Table:</strong> ${tableNumber || 'Walk-in'}</p>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${cartItems.map((it) => `<tr><td>${it.name}</td><td>${it.quantity}</td><td>$${it.price.toFixed(2)}</td><td>$${it.total.toFixed(2)}</td></tr>`).join('')}
          </tbody>
        </table>
        <div style="margin-top: 20px;">
          <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
          ${discount > 0 ? `<p><strong>Discount:</strong> -$${discount.toFixed(2)}</p>` : ''}
          <p><strong>Tax:</strong> $${tax.toFixed(2)}</p>
          <p class="total"><strong>TOTAL: $${total.toFixed(2)}</strong></p>
        </div>
      </body>
      </html>`
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(invoiceHtml)
      w.document.close()
      w.print()
    } else alert('Popup blocked — allow popups to print')
  }

  const fetchPreordersForTable = async (tableNum: number) => {
    try {
      const res = await fetch(`/api/preorders?tableNumber=${tableNum}`)
      if (res.ok) {
        const data = await res.json()
        return data.preorders || []
      }
    } catch (err) {
      console.log(' Error fetching preorders', err)
    }
    return []
  }

  const importPreorders = async (tableNum: number | null) => {
    if (!tableNum) return alert('Select a table first')
    const preorders = await fetchPreordersForTable(tableNum)
    if (!preorders.length) return alert('No preorders for this table')
    const itemsToAdd: any[] = []
    preorders.forEach((p: any) => {
      p.items.forEach((it: any) => itemsToAdd.push(it))
    })
    itemsToAdd.forEach((it) => {
      setCartItems((prev) => {
        const existing = prev.find((i) => i.foodItemId === it.foodItemId)
        if (existing) {
          return prev.map((i) =>
            i.foodItemId === it.foodItemId
              ? { ...i, quantity: i.quantity + (it.qty || it.quantity || 1), total: (i.quantity + (it.qty || it.quantity || 1)) * i.price }
              : i
          )
        }
        return [
          ...prev,
          {
            foodItemId: it.foodItemId || `${it.name}-${Math.random()}`,
            name: it.name,
            price: Number(it.price),
            quantity: it.qty || it.quantity || 1,
            total: Number(it.price) * (it.qty || it.quantity || 1),
          },
        ]
      })
    })
    alert('✓ Preorders imported into cart')
  }

  const handlePayBill = async (billId: string) => {
    try {
      if (!billId) return alert('Invalid bill id')
      const res = await fetch(`/api/billing/${billId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })

      const text = await res.text()
      let data: any = null
      try {
        data = text ? JSON.parse(text) : null
      } catch (e) {
        data = { raw: text }
      }

      if (res.ok) {
        const updatedBill = data?.bill
        if (updatedBill) {
          setBills((prev) => prev.map((b) => (b._id === updatedBill._id ? updatedBill : b)))
          alert('✓ Bill marked as paid')
        } else {
          await fetchBills()
        }
      } else {
        console.log(' Failed to pay bill', res.status, data)
        alert('Failed to mark bill as paid — see console for details')
        await fetchBills()
      }
    } catch (err) {
      console.log(' Error updating bill:', err)
    }
  }

  const handleDeleteBill = async (billId: string) => {
    if (!confirm('Delete this bill?')) return

    try {
      const res = await fetch(`/api/billing/${billId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setBills((prev) => prev.filter((b) => b._id !== billId))
        alert('✓ Bill deleted')
      }
    } catch (err) {
      console.log(' Error deleting bill:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">💳 Billing & Invoice</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Manage bills, create invoices, track payments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg transition shadow-md"
          >
            ← Back
          </button>
          <button
            onClick={() => {
              setShowNewBill(!showNewBill)
              if (showNewBill) {
                setCartItems([])
                setTableNumber(null)
                setCustomerName('')
              }
            }}
            className={`px-5 py-2.5 font-semibold rounded-lg transition shadow-md text-white ${
              showNewBill ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {showNewBill ? '✕ Cancel' : '+ New Bill'}
          </button>
        </div>
      </div>

      {/* New Bill Form */}
      {showNewBill && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Menu Items */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">📋 Menu Items</h2>

            {/* Customer & Table Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Customer Name (Optional)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Table Number (Optional)</label>
                <input
                  type="number"
                  value={tableNumber || ''}
                  onChange={(e) => setTableNumber(e.target.value ? Number(e.target.value) : null)}
                  placeholder="e.g., 5"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Load Preorders */}
            <button
              onClick={() => importPreorders(tableNumber)}
              className="mb-6 w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition shadow-md"
            >
              📦 Load Preorders for Table {tableNumber || 'N/A'}
            </button>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {menuItems.length === 0 ? (
                <p className="col-span-3 text-center text-slate-500 dark:text-slate-400 py-6">Loading menu items...</p>
              ) : (
                menuItems.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => addItemToCart(item)}
                    className="bg-slate-50 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-600 border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 rounded-lg p-4 transition transform hover:scale-105 shadow-sm"
                  >
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg mt-2">${Number(item.price).toFixed(2)}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Invoice Panel */}
          <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-xl shadow-2xl p-6 border border-slate-700 h-fit text-white">
            <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-slate-600">🧾 Invoice</h2>

            {/* Cart Items */}
            <div className="space-y-3 mb-6 max-h-80 overflow-y-auto bg-slate-800/50 p-4 rounded-lg">
              {cartItems.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">No items added</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.foodItemId} className="flex justify-between items-start border-b border-slate-700 pb-3 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{item.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.foodItemId, item.quantity - 1)}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-white"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 bg-slate-700 rounded text-xs font-bold text-white min-w-[2.5rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.foodItemId, item.quantity + 1)}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-white"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.foodItemId)}
                          className="ml-auto px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-bold text-white"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <p className="font-bold text-emerald-400 ml-2 text-sm">${item.total.toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>

            {/* Totals Section */}
            <div className="space-y-3 border-t border-slate-600 pt-4 mb-6 bg-slate-800/50 p-4 rounded-lg">
              <div className="flex justify-between text-sm text-slate-300">
                <span>Subtotal:</span>
                <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm text-slate-300">
                <label className="font-semibold">Discount (%):</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.max(0, Number(e.target.value)))}
                  className="w-14 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-slate-100 text-right text-xs font-bold focus:outline-none"
                  min="0"
                  max="100"
                />
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-red-400">
                  <span>Discount:</span>
                  <span className="font-bold">−${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-slate-300">
                <label className="font-semibold">Tax (%):</label>
                <input
                  type="number"
                  value={taxRate * 100}
                  onChange={(e) => setTaxRate(Number(e.target.value) / 100)}
                  className="w-14 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-slate-100 text-right text-xs font-bold focus:outline-none"
                  min="0"
                  max="100"
                />
              </div>

              <div className="flex justify-between text-sm text-slate-300">
                <span>Tax:</span>
                <span className="font-bold text-white">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xl font-bold pt-2 border-t border-slate-600 text-white">
                <span>Total:</span>
                <span className="text-emerald-400">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Mode Selection */}
            <div className="mb-4 p-4 bg-slate-800/50 rounded-lg">
              <label className="block text-sm font-semibold text-slate-300 mb-3">Payment Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {(['cash', 'card', 'upi', 'cheque'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
                      paymentMode === mode
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={sendToKOT}
                disabled={cartItems.length === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                🍳 Send to KOT
              </button>
              <button
                onClick={printInvoice}
                disabled={cartItems.length === 0}
                className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleCreateBill}
                disabled={cartItems.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                ✓ Complete & Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bills */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">📊 Bill Logs (Completed)</h2>

        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <p className="text-lg">Loading bills...</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <p className="text-lg">No bills created yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-700 border-b-2 border-slate-300 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Bill #</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Customer/Table</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Payment Mode</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {bills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{bill.billNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {bill.customerName || (bill.tableNumber ? `Table ${bill.tableNumber}` : 'Walk-in')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {bill.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{Number(bill.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 uppercase">
                        {bill.paymentMode || bill.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          bill.status === 'paid'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                            : bill.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                        }`}
                      >
                        {bill.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded text-xs transition shadow-md"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => handleDeleteBill(bill._id)}
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
        )}
      </div>

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-300 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200 dark:border-slate-700">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Bill {selectedBill.billNumber}</h3>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Bill Info */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Bill Date</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {new Date(selectedBill.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedBill.tableNumber && (
                  <div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Table</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">Table {selectedBill.tableNumber}</p>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-slate-900 dark:text-white">Item</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-slate-900 dark:text-white">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-white">Price</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-white">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {selectedBill.items.map((item, i) => {
                      const qty = Number(item.quantity || 0)
                      const price = Number(item.price || 0)
                      const totalItem = Number(item.total ?? price * qty)
                      return (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                          <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">{item.name}</td>
                          <td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-300">{qty}</td>
                          <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-300">
                            ${price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-white">
                            ${totalItem.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bill Totals */}
              <div className="space-y-3 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border-2 border-slate-300 dark:border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">Subtotal:</span>
                  <span className="font-bold text-slate-900 dark:text-white">${Number(selectedBill.subtotal || 0).toFixed(2)}</span>
                </div>
                {Number(selectedBill.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-300">Discount:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">−${Number(selectedBill.discount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">Tax:</span>
                  <span className="font-bold text-slate-900 dark:text-white">${Number(selectedBill.tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-slate-300 dark:border-slate-700">
                  <span className="text-slate-900 dark:text-white">Total:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">${Number(selectedBill.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBill(null)}
              className="w-full mt-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-lg transition shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
