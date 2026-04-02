'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Check, ChefHat, Trash2, Search, Printer } from 'lucide-react'
import { orderService } from '@/lib/order-service'
interface Table {
  _id: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'on-hold'
  isDefault?: boolean
  tableName?: string
}

interface MenuItem {
  _id: string
  name: string
  price: number
  category: string
}

interface OrderItem {
  _id: string
  name: string
  price: number
  qty: number
  sentToKOT?: boolean
  lastSentQty?: number  // Track last sent quantity to detect changes
}

interface KOTLog {
  id: string
  kotNumber: number
  tableNumber: number | null
  items: OrderItem[]
  timestamp: string
  kotCount: number
  isNew?: boolean
}

interface TableOrderState {
  items: OrderItem[]
  kotSent: boolean
  firstKotDone: boolean
  orderId?: string  // Track the LocalOrder ID
  billItems: OrderItem[]  // Cumulative items for the bill
  onHold: boolean
}

export default function TablesPage() {
  const router = useRouter()
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [tableOrders, setTableOrders] = useState<Record<string, TableOrderState>>({})
  const [walkInOrders, setWalkInOrders] = useState<Record<string, TableOrderState>>({})
  const [kotLogs, setKotLogs] = useState<KOTLog[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedWalkInId, setSelectedWalkInId] = useState<string | null>(null)
  const [showKotPrintModal, setShowKotPrintModal] = useState(false)
  const [paymentMode, setPaymentMode] = useState<string>('cash')
  const [splitPaymentMode, setSplitPaymentMode] = useState<boolean>(false)
  const [splitPayments, setSplitPayments] = useState<{mode: string, amount: number}[]>([
    { mode: 'cash', amount: 0 },
    { mode: 'upi', amount: 0 }
  ])
  const [discount, setDiscount] = useState<number>(0)
  const [roundOff, setRoundOff] = useState<number>(0)
  const [customerName, setCustomerName] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [kotPrintContent, setKotPrintContent] = useState<{ items: OrderItem[]; table: string } | null>(null)
  
  // Resizable section widths (modal only)
  const [menuWidth, setMenuWidth] = useState(50)  // percentage of modal
  const [cartWidth, setCartWidth] = useState(50)  // percentage of modal

  // Derived state - moved before useEffect to fix temporal dead zone error
  const currentCart = selectedWalkInId !== null
    ? walkInOrders[selectedWalkInId]?.items || []
    : selectedTable
    ? tableOrders[selectedTable._id]?.items || []
    : []

  const currentOrderState = selectedWalkInId !== null
    ? walkInOrders[selectedWalkInId]
    : selectedTable
    ? tableOrders[selectedTable._id]
    : null

  // Load tables and menu on mount
  useEffect(() => {
    loadLocalTables()
    loadLocalMenu()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when billing modal is open
      if (!showBillingModal) return

      // Ctrl+P or Cmd+P for Print KOT
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        if (currentCart.length > 0) {
          sendToKOT()
        }
      }

      // Ctrl+Enter for Complete & Pay
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (currentOrderState?.billItems && currentOrderState.billItems.length > 0) {
          completeAndPay()
        }
      }

      // Ctrl+H for Hold Order
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        handleHoldOrder()
      }

      // Escape to close modal
      if (e.key === 'Escape') {
        handleCloseModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showBillingModal, currentCart, currentOrderState])

  // Load tables and menu on mount
  useEffect(() => {
    loadLocalTables()
    loadLocalMenu()
  }, [])

  const handleModalDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startMenuWidth = menuWidth
    const modalWidth = window.innerWidth * 0.95  // approximate modal width

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX
      const deltaPercent = (deltaX / modalWidth) * 100
      const newMenuWidth = Math.max(30, Math.min(70, startMenuWidth + deltaPercent))
      setMenuWidth(newMenuWidth)
      setCartWidth(100 - newMenuWidth)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Load tables from API
  const loadLocalTables = async () => {
    try {
      const res = await fetch('/api/tables')
      if (res.ok) {
        const data = await res.json()
        const tablesData = (data.tables || data || []) as Table[]
        setTables(tablesData)
      } else {
        throw new Error('Failed to fetch tables')
      }
    } catch (err) {
      console.error('[Tables] Error loading tables:', err)
      // Show error to user
      alert('Failed to load tables. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // Load menu from API
  const loadLocalMenu = async () => {
    try {
      const res = await fetch('/api/menu')
      if (res.ok) {
        const data = await res.json()
        const items = (data.items || []) as MenuItem[]
        setMenuItems(items)
        const cats = [...new Set(items.map((item: MenuItem) => item.category))] as string[]
        setCategories(cats)
        if (cats.length > 0) setSelectedCategory(cats[0])
      } else {
        throw new Error('Failed to fetch menu')
      }
    } catch (err) {
      console.error('[Tables] Error loading menu:', err)
      // Show error to user
      alert('Failed to load menu. Please check your connection.')
      setMenuItems([])
      setCategories([])
    }
  }

  const updateTableStatus = async (tableId: string, status: string) => {
    // Update local state immediately for responsiveness
    setTables((prev) =>
      prev.map((t) => (t._id === tableId ? { ...t, status: status as any } : t))
    )
    
    // Sync to database
    try {
      const res = await fetch('/api/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, status })
      })
      
      if (res.ok) {
        const data = await res.json()
        // Update local state with the returned data from database
        if (data.table) {
          setTables((prev) =>
            prev.map((t) => (t._id === tableId ? data.table : t))
          )
        }
      } else {
        console.error('Failed to update table status:', await res.text())
      }
    } catch (err) {
      console.error('Failed to update table status:', err)
    }
  }

  const handleTableClick = (table: Table) => {
    setSelectedTable(table)
    setSelectedWalkInId(null)
    
    // Initialize order state if first time
    if (!tableOrders[table._id]) {
      setTableOrders({
        ...tableOrders,
        [table._id]: {
          items: [],
          kotSent: false,
          firstKotDone: false,
          billItems: [],
          onHold: false,
        },
      })
    }
    
    // Update table status to occupied only on first click
    if (table.status === 'available') {
      updateTableStatus(table._id, 'occupied')
    }
    setShowBillingModal(true)
  }

  const handleWalkInClick = () => {
    const walkInId = `walk-in-${Date.now()}`
    setSelectedTable(null)
    setSelectedWalkInId(walkInId)
    
    // Initialize walk-in order state
    if (!walkInOrders[walkInId]) {
      setWalkInOrders({
        ...walkInOrders,
        [walkInId]: {
          items: [],
          kotSent: false,
          firstKotDone: false,
          billItems: [],
          onHold: false,
        },
      })
    }
    
    setShowBillingModal(true)
  }

  const handleCloseModal = () => {
    // When closing modal, set table to on-hold (order persists)
    if (selectedTable && selectedTable.status === 'occupied') {
      updateTableStatus(selectedTable._id, 'on-hold')
    }
    setShowBillingModal(false)
    setSelectedWalkInId(null)
  }

  const handleHoldOrder = () => {
    const isWalkIn = selectedWalkInId !== null
    const tableId = isWalkIn ? selectedWalkInId : selectedTable?._id
    if (!tableId) return

    // Mark as on hold
    if (!isWalkIn && selectedTable) {
      updateTableStatus(selectedTable._id, 'on-hold')
    }

    // Update order state to mark as on hold
    if (isWalkIn) {
      const orderState = walkInOrders[tableId]
      if (orderState) {
        setWalkInOrders({
          ...walkInOrders,
          [tableId]: { ...orderState, onHold: true },
        })
      }
    } else {
      const orderState = tableOrders[tableId]
      if (orderState) {
        setTableOrders({
          ...tableOrders,
          [tableId]: { ...orderState, onHold: true },
        })
      }
    }

    // Close modal and return to tables
    setShowBillingModal(false)
    setSelectedTable(null)
    setSelectedWalkInId(null)
  }

  const cancelTableOrder = () => {
    const isWalkIn = selectedWalkInId !== null
    const tableId = isWalkIn ? selectedWalkInId : selectedTable?._id
    if (!tableId) return

    if (!confirm('Are you sure you want to cancel this order?')) return

    // Add cancelled entry to KOT log with all ordered meals
    if (selectedTable || isWalkIn) {
      const orderState = isWalkIn 
        ? walkInOrders[tableId]
        : tableOrders[tableId]
      
      const cancelledLog: KOTLog = {
        id: `cancelled-${Date.now()}`,
        kotNumber: kotLogs.length + 1,
        tableNumber: isWalkIn ? null : selectedTable?.number || null,
        items: [
          { _id: 'cancelled', name: '*** ORDER CANCELLED ***', price: 0, qty: 1 },
          ...(orderState?.items || [])  // Include all ordered meals
        ],
        timestamp: new Date().toLocaleTimeString(),
        kotCount: 0,
      }
      setKotLogs([cancelledLog, ...kotLogs])
    }

    // Reset table to available
    if (selectedTable) {
      updateTableStatus(selectedTable._id, 'available')
    }

    // Clear order
    if (isWalkIn) {
      const newWalkInOrders = { ...walkInOrders }
      delete newWalkInOrders[tableId]
      setWalkInOrders(newWalkInOrders)
    } else {
      setTableOrders({
        ...tableOrders,
        [tableId]: {
          items: [],
          kotSent: false,
          firstKotDone: false,
          billItems: [],
          onHold: false,
        },
      })
    }

    setShowBillingModal(false)
  }

  const addMenuItemToCart = (item: MenuItem) => {
    if (!selectedTable && !selectedWalkInId) return

    const isWalkIn = selectedWalkInId !== null
    const tableId = isWalkIn ? selectedWalkInId : selectedTable?._id
    if (!tableId) return

    const orderState = isWalkIn 
      ? walkInOrders[tableId] || { items: [], kotSent: false, firstKotDone: false, billItems: [], onHold: false }
      : tableOrders[tableId] || { items: [], kotSent: false, firstKotDone: false, billItems: [], onHold: false }
    
    const currentCart = orderState.items || []

    // Check if item already exists in current order
    const existingItem = currentCart.find((i) => i._id === item._id)
    if (existingItem) {
      const updatedCart = currentCart.map((i) =>
        i._id === item._id ? { ...i, qty: i.qty + 1 } : i
      )
      if (isWalkIn) {
        setWalkInOrders({
          ...walkInOrders,
          [tableId]: { ...orderState, items: updatedCart },
        })
      } else {
        setTableOrders({
          ...tableOrders,
          [tableId]: { ...orderState, items: updatedCart },
        })
      }
    } else {
      const newItem = {
        _id: item._id,
        name: item.name,
        price: item.price,
        qty: 1,
        sentToKOT: false,
        lastSentQty: 0,  // Initialize to 0 so items can be sent to KOT
      }
      const updatedCart = [...currentCart, newItem]
      if (isWalkIn) {
        setWalkInOrders({
          ...walkInOrders,
          [tableId]: { ...orderState, items: updatedCart },
        })
      } else {
        setTableOrders({
          ...tableOrders,
          [tableId]: { ...orderState, items: updatedCart },
        })
      }
    }
  }


  const sendToKOT = async () => {
    const isWalkIn = selectedWalkInId !== null
    const tableId = isWalkIn ? selectedWalkInId : selectedTable?._id
    if (!tableId) return

    const orderState = isWalkIn 
      ? walkInOrders[tableId]
      : tableOrders[tableId]
    
    if (!orderState || orderState.items.length === 0) {
      alert('No items in cart')
      return
    }

    // Send items that are NEW or have INCREASED quantity
    const itemsToSend = orderState.items.filter((item) => {
      const lastQty = item.lastSentQty ?? 0
      return item.qty > lastQty  // Only send if new or quantity increased
    })

    if (itemsToSend.length === 0) {
      alert('No items to send to kitchen')
      return
    }

    try {
      let orderId = orderState.orderId
      let kotData = null

      if (!orderId) {
        // First time sending - create new order with KOT
        const subtotal = itemsToSend.reduce((sum, item) => sum + item.price * item.qty, 0)
        const { order, kot } = await orderService.createOrderWithKOT({
          tableNumber: isWalkIn ? undefined : selectedTable?.number,
          customerName: customerName || undefined,
          items: itemsToSend,
          subtotal,
          tax: subtotal * 0.1,
          discount: 0,
          total: subtotal * 1.1,
        })
        orderId = order.id
        kotData = kot
      } else {
        // Sending additional items - create new KOT with only new items
        kotData = await orderService.sendAdditionalItemsToKOT(orderId, itemsToSend)
      }

      const kotLog: KOTLog = {
        id: kotData?.id || `kot-${Date.now()}`,
        kotNumber: kotLogs.length + 1,
        tableNumber: isWalkIn ? null : selectedTable?.number || null,
        items: itemsToSend,
        timestamp: new Date().toLocaleTimeString(),
        kotCount: kotLogs.filter(k => k.tableNumber === (isWalkIn ? null : selectedTable?.number)).length + 1,
        isNew: true,
      }
      setKotLogs([kotLog, ...kotLogs])
      setKotPrintContent({
        items: itemsToSend,
        table: isWalkIn ? 'Walk-in Customer' : `Table ${selectedTable?.number}`,
      })

      // Move sent items to billItems and clear items array
      const updatedBillItems = [...(orderState.billItems || []), ...itemsToSend]
      
      if (isWalkIn) {
        setWalkInOrders({
          ...walkInOrders,
          [tableId]: {
            items: [],  // Clear items after sending to KOT
            kotSent: true,
            firstKotDone: true,
            orderId,
            billItems: updatedBillItems,
            onHold: false,
          },
        })
      } else {
        setTableOrders({
          ...tableOrders,
          [tableId]: {
            items: [],  // Clear items after sending to KOT
            kotSent: true,
            firstKotDone: true,
            orderId,
            billItems: updatedBillItems,
            onHold: false,
          },
        })
      }

      setShowKotPrintModal(true)
      alert('✓ Order sent to kitchen')
      
      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setShowBillingModal(false)
        setSelectedTable(null)
        setSelectedWalkInId(null)
        if (selectedTable) {
          updateTableStatus(selectedTable._id, 'occupied')
        }
      }, 2000)
    } catch (err) {
      console.log('Error sending to KOT:', err)
      alert('Failed to send order to kitchen')
    }
  }

  const completeAndPay = async () => {
    const isWalkIn = selectedWalkInId !== null
    const tableId = isWalkIn ? selectedWalkInId : selectedTable?._id
    if (!tableId) return

    const orderState = isWalkIn 
      ? walkInOrders[tableId]
      : tableOrders[tableId]
    
    if (!orderState || (orderState.billItems?.length || 0) === 0) {
      alert('No items to pay')
      return
    }

    // Show payment modal for payment details
    setShowPaymentModal(true)
  }

  const removeFromBill = (itemIndex: number) => {
    const isWalkIn = selectedWalkInId !== null
    const tableId = isWalkIn ? selectedWalkInId : selectedTable?._id
    if (!tableId) return

    const orderState = isWalkIn 
      ? walkInOrders[tableId]
      : tableOrders[tableId]
    
    if (!orderState) return

    const updatedBillItems = orderState.billItems?.filter((_, idx) => idx !== itemIndex) || []
    
    if (isWalkIn) {
      setWalkInOrders({
        ...walkInOrders,
        [tableId]: {
          ...orderState,
          billItems: updatedBillItems,
        },
      })
    } else {
      setTableOrders({
        ...tableOrders,
        [tableId]: {
          ...orderState,
          billItems: updatedBillItems,
        },
      })
    }
  }

  const finalizePayment = async () => {
    const isWalkIn = selectedWalkInId !== null
    const tableId = isWalkIn ? selectedWalkInId : selectedTable?._id
    if (!tableId) return

    const orderState = isWalkIn 
      ? walkInOrders[tableId]
      : tableOrders[tableId]
    // Use billItems which has accumulated all items ordered
    const items = orderState?.billItems || []

    try {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
      const afterDiscount = subtotal - discount
      const tax = afterDiscount * 0.1
      const beforeRoundOff = afterDiscount + tax
      const total = beforeRoundOff + roundOff

      const billData = {
        tableNumber: isWalkIn ? null : selectedTable?.number,
        items: items,
        subtotal,
        discount,
        tax,
        roundOff,
        total,
        paymentMode,
        status: 'completed',
        ...(customerName && { customerName }),
        ...(customerPhone && { customerPhone }),
      }

      // Submit bill to server
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData),
      })

      if (!res.ok) {
        throw new Error('Failed to submit bill')
      }

      console.log('[Tables] Bill submitted successfully to server')

      // Save order to database for orders page
      const orderData = {
        id: `order-${Date.now()}`,
        tableNumber: isWalkIn ? null : selectedTable?.number,
        customerName: customerName || (isWalkIn ? 'Walk-in' : `Table ${selectedTable?.number}`),
        items: items.map(item => ({
          id: item._id,
          name: item.name,
          qty: item.qty,
          price: item.price,
        })),
        subtotal,
        tax,
        discount,
        total,
        paymentMode,
        status: 'completed',
        createdAt: new Date().toISOString(),
      }

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      // Update order status to paid if exists
      if (orderState?.orderId) {
        await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderState.orderId, status: 'completed' }),
        })
      }

      // Print bill
      printBill({
        items,
        subtotal,
        discount,
        tax,
        roundOff,
        total,
        paymentMode,
        tableNumber: isWalkIn ? null : selectedTable?.number,
        customerName,
        customerPhone,
      })

      // Clear order and reset table to available
      if (isWalkIn) {
        const newWalkInOrders = { ...walkInOrders }
        delete newWalkInOrders[tableId]
        setWalkInOrders(newWalkInOrders)
      } else {
        setTableOrders({
          ...tableOrders,
          [tableId]: {
            items: [],
            kotSent: false,
            firstKotDone: false,
            billItems: [],
            onHold: false,
          },
        })
        if (selectedTable) {
          updateTableStatus(selectedTable._id, 'available')
        }
      }
      setShowPaymentModal(false)
      setShowBillingModal(false)
      setPaymentMode('cash')
      setDiscount(0)
      setRoundOff(0)
      setCustomerName('')
      setCustomerPhone('')
      setSelectedTable(null)
      setSelectedWalkInId(null)
      
      alert('Payment completed successfully!')
    } catch (err) {
      console.error('[Tables] Error completing payment:', err)
      alert('Failed to complete payment. Please check your connection.')
    }
  }

  const printBill = (billData: {
    items: OrderItem[]
    subtotal: number
    discount: number
    tax: number
    roundOff: number
    total: number
    paymentMode: string
    tableNumber?: number | null
    customerName?: string
    customerPhone?: string
  }) => {
    const now = new Date()
    const billContent = `
========== RESTAURANT BILL ==========
Date: ${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
${billData.tableNumber ? `Table: ${billData.tableNumber}` : `Type: Walk-in`}
${billData.customerName ? `Customer: ${billData.customerName}` : ''}
${billData.customerPhone ? `Phone: ${billData.customerPhone}` : ''}
======================================
${billData.items.map((item) => `${item.name.substring(0, 25).padEnd(25)} x${item.qty} ₹${(item.price * item.qty).toFixed(2).padStart(7)}`).join('\n')}
======================================
Subtotal...................... ₹${billData.subtotal.toFixed(2).padStart(7)}
${billData.discount > 0 ? `Discount..................... -₹${billData.discount.toFixed(2).padStart(7)}\n` : ''}Tax (10%).................... ₹${billData.tax.toFixed(2).padStart(7)}
${billData.roundOff !== 0 ? `Round Off.................... ${billData.roundOff > 0 ? '+' : '-'}₹${Math.abs(billData.roundOff).toFixed(2).padStart(7)}\n` : ''}======================================
TOTAL......................... ₹${billData.total.toFixed(2).padStart(7)}
======================================
Payment Mode: ${billData.paymentMode.toUpperCase()}

   **Thank You! Visit Again**
      Have a Great Day!
======================================
`

    const printWindow = window.open('', '', 'height=700,width=420')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Courier New', monospace; margin: 10px; }
            pre { font-size: 12px; line-height: 1.5; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <pre>${billContent}</pre>
        </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => printWindow.print(), 250)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'from-orange-400 to-orange-600'
      case 'on-hold':
        return 'from-yellow-400 to-yellow-600'
      case 'available':
        return 'from-emerald-400 to-emerald-600'
      default:
        return 'from-gray-400 to-gray-600'
    }
  }

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Left Content Area - Tables */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  title="Back to Dashboard"
                >
                  ← Back
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">🍽️ Restaurant POS</h1>
                  <p className="text-gray-600 text-sm">Table Management & Billing</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/dashboard/manage-tables')}
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg flex items-center gap-2 transition shadow-md active:scale-95"
              >
                <ChefHat size={20} />
                <span>Manage Tables</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="text-center text-gray-600">Loading tables...</div>
            ) : (
              <div className="space-y-6">
                {/* Walk-in Section */}
                {Object.entries(walkInOrders).length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Walk-in Orders</h2>
                    <div className="grid grid-cols-6 gap-3">
                      {Object.entries(walkInOrders).map(([walkInId, orderState]) => {
                        const cart = orderState?.items || []
                        return (
                          <div key={walkInId} className="group relative">
                            <div
                              onClick={() => {
                                setSelectedTable(null)
                                setSelectedWalkInId(walkInId)
                                setShowBillingModal(true)
                              }}
                              className={`p-4 cursor-pointer transition-all border-2 bg-white ${
                                selectedWalkInId === walkInId && showBillingModal
                                  ? 'border-purple-600 shadow-lg'
                                  : 'border-gray-300 hover:border-purple-400 hover:shadow-md'
                              } group-hover:scale-105 transform`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-900">Walk-in</h3>
                                {cart.length > 0 && (
                                  <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                    {cart.length} items
                                  </span>
                                )}
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded text-white ${
                                    orderState?.kotSent
                                      ? 'bg-orange-500'
                                      : 'bg-purple-500'
                                  }`}
                                >
                                  {orderState?.kotSent ? 'Processing' : 'Pending'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const newWalkInOrders = { ...walkInOrders }
                                delete newWalkInOrders[walkInId]
                                setWalkInOrders(newWalkInOrders)
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Add Walk-in Button */}
                <button
                  onClick={handleWalkInClick}
                  className="w-full p-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all text-lg shadow-md active:scale-95"
                >
                  + Add Walk-in Customer
                </button>

                {/* Tables Grid - Square Shapes */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">🍽️ Tables</h2>
                  <div className="grid grid-cols-6 gap-3">
                    {tables.map((table) => {
                      const orderState = tableOrders[table._id]
                      const cart = orderState?.items || []
                      return (
                        <div key={table._id} className="group relative">
                          <div
                            onClick={() => handleTableClick(table)}
                            className={`p-4 cursor-pointer transition-all border-2 aspect-square flex flex-col items-center justify-center ${
                              table.status === 'occupied'
                                ? 'bg-orange-100 border-orange-400'
                                : table.status === 'on-hold'
                                ? 'bg-yellow-100 border-yellow-400'
                                : 'bg-emerald-100 border-emerald-400'
                            } hover:shadow-md group-hover:scale-105 transform`}
                          >
                          <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {table.number}
                            </h3>
                            {table.tableName && (
                              <p className="text-sm text-purple-700 font-bold mt-2 truncate">
                                📍 {table.tableName}
                              </p>
                            )}
                            <p className="text-xs text-gray-600 mt-1 font-medium">
                              {table.capacity} seats
                            </p>
                              {cart.length > 0 && (
                                <span className="inline-block text-xs font-bold bg-white text-gray-900 px-2 py-0.5 rounded mt-1">
                                  {cart.length} items
                                </span>
                              )}
                              <span
                                className={`inline-block text-xs font-bold px-2 py-0.5 rounded text-white mt-1 ml-1 ${
                                  table.status === 'occupied'
                                    ? 'bg-orange-500'
                                    : table.status === 'on-hold'
                                    ? 'bg-yellow-500'
                                    : 'bg-emerald-500'
                                }`}
                              >
                                {table.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Kitchen & Billing */}
        <div className="w-96 bg-white border-l border-gray-300 flex flex-col overflow-hidden shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-300 p-4 bg-blue-600 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <ChefHat size={20} />
              <span>Kitchen &amp; Billing</span>
            </div>
          </div>

          {/* Bill Preview Section */}
          {(selectedTable || selectedWalkInId !== null) && currentOrderState && currentOrderState.billItems && currentOrderState.billItems.length > 0 && (
            <div className="border-b border-gray-300 p-4 bg-gray-100">
              <h3 className="text-gray-900 font-semibold text-sm mb-3">💰 Order Summary</h3>
              <div className="bg-white p-3 rounded-lg text-xs text-gray-700 space-y-1 border border-gray-300">
                <div className="flex justify-between font-semibold">
                  <span>Table:</span>
                  <span className="text-gray-900">
                    {selectedWalkInId !== null ? 'Walk-in' : `Table ${selectedTable?.number}`}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  {currentOrderState.billItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.name} x{item.qty}</span>
                      <span className="font-semibold">₹{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total:</span>
                    <span>
                      ₹{currentOrderState.billItems.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KOT Logs List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <h3 className="text-gray-900 font-semibold text-sm sticky top-0 bg-white pb-2">🦊 KOT Tickets</h3>
            {kotLogs.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-8">
                No kitchen orders yet
              </div>
            ) : (
              kotLogs.map((log) => (
                <div
                  key={log.id}
                  className={`border rounded-lg p-3 shadow-sm ${
                    log.isNew ? 'bg-yellow-50 border-yellow-300' : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900 text-sm">
                      {log.tableNumber ? `🍽️ Table ${log.tableNumber}` : '👥 Walk-in'}
                    </span>
                    <div className="flex gap-2">
                      <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded font-semibold">
                        KOT #{log.kotCount || 1}
                      </span>
                      <span className="text-xs text-gray-600">{log.timestamp}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {log.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-gray-700 flex justify-between"
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="font-bold bg-orange-200 text-orange-800 px-2 py-0.5 rounded">x{item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Billing Modal */}
      {showBillingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
          <div className="bg-white rounded-xl w-full max-w-7xl max-h-[95vh] flex flex-col border border-gray-300 shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b border-gray-300 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">
                {selectedWalkInId !== null ? '👥 Walk-in Order' : `🍽️ Table ${selectedTable?.number}`}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200 transition text-2xl"
              >
                <X size={28} />
              </button>
            </div>

            {/* Modal Content - Three Columns */}
            <div className="flex-1 overflow-hidden flex gap-1 bg-gray-50">
              {/* Left: Menu Items - Resizable */}
              <div style={{ width: `${menuWidth}%` }} className="border-r border-gray-300 overflow-y-auto flex flex-col bg-white transition-all">
                {/* Search Bar */}
                <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-300 shadow-sm z-10">
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">
                    <Search size={18} className="text-gray-600" />
                    <input
                      type="text"
                      placeholder="Search menu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-gray-100 text-gray-900 outline-none text-sm placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="sticky top-14 bg-white px-4 py-3 border-b border-gray-300 overflow-x-auto shadow-sm z-10">
                  <div className="flex gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                          selectedCategory === cat
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Items Grid */}
                <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                  {filteredMenuItems.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No items found</p>
                  ) : (
                    filteredMenuItems.map((item, index) => (
                      <button
                        key={`${item._id}-${index}`}
                        onClick={() => addMenuItemToCart(item)}
                        className="w-full text-left bg-white hover:bg-blue-50 p-4 rounded-lg transition border-2 border-gray-200 hover:border-blue-400 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-gray-900 font-bold text-base">{item.name}</p>
                            <p className="text-blue-600 text-base font-bold mt-1">
                              ₹{item.price}
                            </p>
                          </div>
                          <Plus size={24} className="text-blue-600 flex-shrink-0" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Resize Divider - Menu to Cart */}
              <div
                onMouseDown={handleModalDividerMouseDown}
                className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0"
              />

              {/* Middle: Cart & Summary - Resizable */}
              <div style={{ width: `${cartWidth}%` }} className="bg-white border-r border-gray-300 flex flex-col transition-all">
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 border-b border-gray-300">
                  <h3 className="text-gray-900 font-bold text-lg mb-3">📋 Order Items</h3>
                  {currentCart.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No items added</p>
                  ) : (
                    currentCart.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-gray-900 text-base font-semibold flex-1">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 font-bold">
                              ₹{(item.price * item.qty).toFixed(2)}
                            </span>
                            <button
                              onClick={() => {
                                const isWalkIn = selectedWalkInId !== null
                                const tableId = isWalkIn ? selectedWalkInId : selectedTable?._id
                                if (tableId && currentOrderState) {
                                  const updatedItems = currentOrderState.items.filter((i) => i._id !== item._id)
                                  if (isWalkIn) {
                                    setWalkInOrders({
                                      ...walkInOrders,
                                      [tableId]: {
                                        ...currentOrderState,
                                        items: updatedItems,
                                      },
                                    })
                                  } else {
                                    setTableOrders({
                                      ...tableOrders,
                                      [tableId]: {
                                        ...currentOrderState,
                                        items: updatedItems,
                                      },
                                    })
                                  }
                                }
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition"
                              title="Remove from order"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          {item.sentToKOT && (
                            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-bold">
                              ✓ Sent to KOT
                            </span>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              onClick={() => {
                                const isWalkIn = selectedWalkInId !== null
                                const tableId = isWalkIn ? selectedWalkInId : selectedTable?._id
                                if (tableId && currentOrderState) {
                                  const updatedItems = currentOrderState.items.map((i) =>
                                    i._id === item._id && i.qty > 1
                                      ? { ...i, qty: i.qty - 1 }
                                      : i
                                  )
                                  if (isWalkIn) {
                                    setWalkInOrders({
                                      ...walkInOrders,
                                      [tableId]: {
                                        ...currentOrderState,
                                        items: updatedItems,
                                      },
                                    })
                                  } else {
                                    setTableOrders({
                                      ...tableOrders,
                                      [tableId]: {
                                        ...currentOrderState,
                                        items: updatedItems,
                                      },
                                    })
                                  }
                                }
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded text-base font-bold"
                            >
                              -
                            </button>
                            <span className="text-gray-900 text-base font-bold w-8 text-center bg-gray-100 py-1 rounded">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => {
                                const isWalkIn = selectedWalkInId !== null
                                const tableId = isWalkIn ? selectedWalkInId : selectedTable?._id
                                if (tableId && currentOrderState) {
                                  const updatedItems = currentOrderState.items.map((i) =>
                                    i._id === item._id
                                      ? { ...i, qty: i.qty + 1 }
                                      : i
                                  )
                                  if (isWalkIn) {
                                    setWalkInOrders({
                                      ...walkInOrders,
                                      [tableId]: {
                                        ...currentOrderState,
                                        items: updatedItems,
                                      },
                                    })
                                  } else {
                                    setTableOrders({
                                      ...tableOrders,
                                      [tableId]: {
                                        ...currentOrderState,
                                        items: updatedItems,
                                      },
                                    })
                                  }
                                }
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded text-base font-bold"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Summary & Buttons */}
                <div className="p-4 space-y-3 bg-blue-50 border-t border-gray-300">
                  {currentCart.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                      <div className="space-y-2 text-gray-900">
                        <div className="flex justify-between font-semibold text-base">
                          <span>Subtotal:</span>
                          <span>
                            ₹{currentCart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold text-base">
                          <span>Tax (10%):</span>
                          <span>
                            ₹{(currentCart.reduce((sum, item) => sum + item.price * item.qty, 0) * 0.1).toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg text-blue-600">
                          <span>Total:</span>
                          <span>
                            ₹{(currentCart.reduce((sum, item) => sum + item.price * item.qty, 0) * 1.1).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={sendToKOT}
                      disabled={currentCart.length === 0}
                      className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-base"
                    >
                      <ChefHat size={20} />
                      Send to KOT
                    </button>
                    <button
                      onClick={handleHoldOrder}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 text-base"
                    >
                      ⏸ Hold
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={completeAndPay}
                      disabled={currentOrderState?.billItems && currentOrderState.billItems.length === 0}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition text-base"
                    >
                      Complete & Pay
                    </button>
                    {selectedTable && (
                      <button
                        onClick={cancelTableOrder}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition text-base"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Right: Bill Preview */}
              <div className="w-80 bg-white flex flex-col border-l border-gray-300">
                <div className="p-4 border-b border-gray-300 bg-green-50">
                  <h3 className="text-gray-900 font-bold text-lg">💸 Bill Preview</h3>
                </div>
                
                {currentOrderState && currentOrderState.billItems && currentOrderState.billItems.length > 0 ? (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      <div className="space-y-2">
                        {currentOrderState.billItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-gray-900 pb-2 border-b border-gray-200">
                            <div className="flex-1">
                              <p className="font-semibold">{item.name}</p>
                              <p className="text-xs text-gray-600">x{item.qty}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">₹{(item.price * item.qty).toFixed(2)}</span>
                              <button
                                onClick={() => removeFromBill(idx)}
                                className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition flex-shrink-0"
                                title="Remove from bill"
                              >
                                -
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200 space-y-2 mt-4">
                        <div className="flex justify-between text-gray-900">
                          <span className="font-semibold">Subtotal:</span>
                          <span className="font-bold">
                            ₹{currentOrderState.billItems.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-900">
                          <span className="font-semibold">Tax (10%):</span>
                          <span className="font-bold">
                            ₹{(currentOrderState.billItems.reduce((sum, item) => sum + item.price * item.qty, 0) * 0.1).toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-blue-300 pt-2 flex justify-between text-blue-700 text-lg">
                          <span className="font-bold">TOTAL:</span>
                          <span className="font-bold">
                            ₹{(currentOrderState.billItems.reduce((sum, item) => sum + item.price * item.qty, 0) * 1.1).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {currentOrderState.kotSent && (
                        <div className="bg-green-100 border-2 border-green-600 p-3 rounded-lg text-center">
                          <p className="text-green-800 font-bold">✓ Order Sent to Kitchen</p>
                        </div>
                      )}
                    </div>

                    {/* Button at bottom */}
                    <div className="p-4 border-t border-gray-300 bg-gray-50 space-y-2">
                      <button
                        onClick={completeAndPay}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Check size={20} />
                        Complete & Pay
                      </button>
                      <button
                        onClick={handleCloseModal}
                        className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition"
                      >
                        Close
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400 text-center">No items in bill</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KOT Print Modal */}
      {showKotPrintModal && kotPrintContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md border-2 border-gray-300 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Printer size={24} />
                Kitchen Order Ticket
              </h2>
              <button
                onClick={() => setShowKotPrintModal(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* KOT Content - Printable */}
            <div className="p-6 bg-white text-gray-900">
              <div id="kotContent" className="text-xs font-mono leading-relaxed space-y-3">
                <div className="text-center border-b-2 border-gray-900 pb-3">
                  <div className="font-bold text-lg tracking-wider">KITCHEN ORDER</div>
                  <div className="text-xs mt-2">{new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</div>
                </div>

                <div className="text-center">
                  <div className="font-bold text-lg border-2 border-gray-900 inline-block px-4 py-2 bg-gray-100">
                    {kotPrintContent.table}
                  </div>
                </div>

                <div className="border-t-2 border-b-2 border-gray-900 py-2 space-y-1">
                  {kotPrintContent.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="flex-1 font-semibold">{item.name}</span>
                      <span className="font-bold text-lg ml-4">×{item.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center text-xs font-bold mt-3">
                  <div className="border-2 border-gray-900 inline-block px-6 py-3 bg-yellow-100">PLEASE PREPARE</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-100 px-4 py-3 flex gap-2 border-t border-gray-300">
              <button
                onClick={() => {
                  const element = document.getElementById('kotContent')
                  if (element) {
                    const printWindow = window.open('', '', 'height=400,width=350')
                    if (printWindow) {
                      printWindow.document.write(`
                        <style>
                          body { font-family: 'Courier New', monospace; font-size: 12px; margin: 10px; }
                          pre { white-space: pre-wrap; }
                        </style>
                        <pre>${element.innerText}</pre>
                      `)
                      printWindow.document.close()
                      setTimeout(() => printWindow.print(), 250)
                    }
                  }
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition text-base"
              >
                Print
              </button>
              <button
                onClick={() => setShowKotPrintModal(false)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition text-base"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl border-2 border-gray-300 overflow-hidden max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between border-b border-gray-300">
              <h2 className="text-2xl font-bold text-white">💳 Payment Details</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <X size={28} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
              {/* Bill Summary */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 space-y-2">
                <h3 className="text-gray-900 font-bold text-lg mb-3">Order Summary</h3>
                <div className="flex justify-between text-gray-900 text-base font-semibold">
                  <span>Subtotal:</span>
                  <span>
                    ₹{(currentOrderState?.billItems || []).reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-900 text-base font-semibold">
                  <span>Tax (10%):</span>
                  <span>
                    ₹{((currentOrderState?.billItems || []).reduce((sum, item) => sum + item.price * item.qty, 0) * 0.1).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 text-base font-bold mb-2">
                    Customer Name <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white text-gray-900 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none placeholder-gray-500 text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 text-base font-bold mb-2">
                    Phone Number <span className="text-gray-500 text-sm font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white text-gray-900 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none placeholder-gray-500 text-base"
                  />
                </div>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-gray-900 text-base font-bold mb-2">Discount Amount (₹)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-white text-gray-900 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-base font-semibold"
                  min="0"
                />
              </div>

              {/* Round Off */}
              <div>
                <label className="block text-gray-900 text-base font-bold mb-2">Round Off (₹)</label>
                <input
                  type="number"
                  value={roundOff}
                  onChange={(e) => setRoundOff(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white text-gray-900 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-base font-semibold"
                  step="0.50"
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-gray-900 text-base font-bold mb-2">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setPaymentMode('cash'); setSplitPaymentMode(false); }}
                    className={`p-3 rounded-lg border-2 font-semibold transition ${paymentMode === 'cash' && !splitPaymentMode ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-900 border-gray-300 hover:border-green-400'}`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentMode('card'); setSplitPaymentMode(false); }}
                    className={`p-3 rounded-lg border-2 font-semibold transition ${paymentMode === 'card' && !splitPaymentMode ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-900 border-gray-300 hover:border-green-400'}`}
                  >
                    💳 Card
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentMode('upi'); setSplitPaymentMode(false); }}
                    className={`p-3 rounded-lg border-2 font-semibold transition ${paymentMode === 'upi' && !splitPaymentMode ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-900 border-gray-300 hover:border-green-400'}`}
                  >
                    📱 UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitPaymentMode(true)}
                    className={`p-3 rounded-lg border-2 font-semibold transition ${splitPaymentMode ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-900 border-gray-300 hover:border-purple-400'}`}
                  >
                    ✂️ Split
                  </button>
                </div>
              </div>

              {/* Split Payment Section */}
              {splitPaymentMode && (
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200 space-y-3">
                  <h4 className="text-gray-900 font-bold">Split Payment</h4>
                  {splitPayments.map((payment, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <select
                        value={payment.mode}
                        onChange={(e) => {
                          const newPayments = [...splitPayments]
                          newPayments[index].mode = e.target.value
                          setSplitPayments(newPayments)
                        }}
                        className="flex-1 bg-white text-gray-900 px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 outline-none"
                      >
                        <option value="cash">💵 Cash</option>
                        <option value="card">💳 Card</option>
                        <option value="upi">📱 UPI</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={payment.amount || ''}
                        onChange={(e) => {
                          const newPayments = [...splitPayments]
                          newPayments[index].amount = parseFloat(e.target.value) || 0
                          setSplitPayments(newPayments)
                        }}
                        className="w-28 bg-white text-gray-900 px-3 py-2 rounded-lg border border-gray-300 focus:border-purple-500 outline-none"
                      />
                      {splitPayments.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setSplitPayments(splitPayments.filter((_, i) => i !== index))}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSplitPayments([...splitPayments, { mode: 'cash', amount: 0 }])}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    + Add Payment Method
                  </button>
                  <div className="text-sm text-gray-700 font-semibold">
                    Total Split: ₹{splitPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)} / ₹{(
                      (currentOrderState?.billItems || []).reduce((sum, item) => sum + item.price * item.qty, 0) -
                      discount +
                      (currentOrderState?.billItems || []).reduce((sum, item) => sum + item.price * item.qty, 0) * 0.1 +
                      roundOff
                    ).toFixed(2)}
                  </div>
                </div>
              )}

              {/* Final Total */}
              <div className="bg-green-600 p-5 rounded-lg mt-4">
                <div className="flex justify-between text-white font-bold text-2xl">
                  <span>TOTAL AMOUNT:</span>
                  <span>
                    ₹
                    {(
                      (currentOrderState?.billItems || []).reduce((sum, item) => sum + item.price * item.qty, 0) -
                      discount +
                      (currentOrderState?.billItems || []).reduce((sum, item) => sum + item.price * item.qty, 0) * 0.1 +
                      roundOff
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-100 px-6 py-4 border-t-2 border-gray-300 flex gap-3">
              <button
                onClick={finalizePayment}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition text-lg"
              >
                Confirm Payment & Print Bill
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition text-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

