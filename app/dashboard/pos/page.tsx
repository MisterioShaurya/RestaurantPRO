'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Minus, Check, ChefHat, Trash2, Settings2, Search, Printer, ArrowLeft, Home, Calendar, Users } from 'lucide-react';

// ==================== Interfaces ====================
interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'on-hold' | 'reserved';
  tableName?: string;
  reservation?: {
    customerName: string;
    date: string;
    time: string;
  };
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  sentToKOT: boolean;
}

interface KOTLog {
  kotNumber: number;
  tableNumber: string;
  items: OrderItem[];
  timestamp: Date;
}

interface TableOrderState {
  items: OrderItem[];
  kotSent: boolean;
  firstKotDone: boolean;
}

// ==================== Sample Data ====================
const SAMPLE_MENU_ITEMS: MenuItem[] = [
  // Appetizers
  { id: '1', name: 'Samosa', price: 80, category: 'Appetizers', description: 'Crispy potato samosa' },
  { id: '2', name: 'Paneer Tikka', price: 150, category: 'Appetizers', description: 'Grilled paneer pieces' },
  { id: '3', name: 'Spring Roll', price: 120, category: 'Appetizers' },

  // Main Course
  { id: '4', name: 'Butter Chicken', price: 280, category: 'Main Course', description: 'Tender chicken in cream sauce' },
  { id: '5', name: 'Paneer Butter Masala', price: 250, category: 'Main Course' },
  { id: '6', name: 'Biryani', price: 220, category: 'Main Course' },
  { id: '7', name: 'Dal Makhani', price: 180, category: 'Main Course' },

  // Breads
  { id: '8', name: 'Naan', price: 50, category: 'Breads' },
  { id: '9', name: 'Roti', price: 30, category: 'Breads' },
  { id: '10', name: 'Garlic Naan', price: 70, category: 'Breads' },

  // Beverages
  { id: '11', name: 'Lassi', price: 60, category: 'Beverages' },
  { id: '12', name: 'Chai', price: 40, category: 'Beverages' },
  { id: '13', name: 'Coca Cola', price: 50, category: 'Beverages' },
];

// ==================== Main Component ====================
export default function POSPage() {
  // ==================== State Management ====================
  const [tables, setTables] = useState<Table[]>([]);
  const [tableOrders, setTableOrders] = useState<Record<string, TableOrderState>>({});
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [kotLogs, setKotLogs] = useState<KOTLog[]>([]);
  const [kotCounter, setKotCounter] = useState(0);

  // Menu search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Payment modal state
  const [discountAmount, setDiscountAmount] = useState(0);
  const [roundOffAmount, setRoundOffAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'upi' | 'split'>('cash');
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);

  // Reservation modal state
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationData, setReservationData] = useState({
    customerName: '',
    customerPhone: '',
    guestCount: 2,
    reservationDate: '',
    reservationTime: '',
  });

  // ==================== Load Data ====================
  useEffect(() => {
    loadTables();
    loadOrders();
  }, []);

  const loadTables = async () => {
    try {
      const res = await fetch('/api/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
      }
    } catch (err) {
      console.error('Error loading tables:', err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        // Process orders into tableOrders format
        const ordersMap: Record<string, TableOrderState> = {};
        data.orders?.forEach((order: any) => {
          if (order.tableId && order.items) {
            ordersMap[order.tableId] = {
              items: order.items,
              kotSent: order.kotSent || false,
              firstKotDone: order.firstKotDone || false,
            };
          }
        });
        setTableOrders(ordersMap);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  // ==================== Computed Values ====================
  const categories = useMemo(
    () => ['All', ...new Set(SAMPLE_MENU_ITEMS.map(item => item.category))],
    []
  );

  const filteredMenuItems = useMemo(() => {
    return SAMPLE_MENU_ITEMS.filter(item => {
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm]);

  const currentTableOrders = selectedTableId ? (tableOrders[selectedTableId] || { items: [], kotSent: false, firstKotDone: false }) : null;
  const currentTableData = selectedTableId && selectedTableId !== 'walk-in' ? tables.find(t => t.id === selectedTableId) : null;

  const calculateBillTotal = (items: OrderItem[], discount: number = 0, roundOff: number = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax - discount + roundOff;
    return { subtotal, tax, total };
  };

  // ==================== Event Handlers ====================
  const handleTableClick = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    if (table.status === 'available') {
      setTables(tables.map(t => (t.id === tableId ? { ...t, status: 'occupied' } : t)));
    }

    setSelectedTableId(tableId);
  };

  const handleWalkInClick = () => {
    setSelectedTableId('walk-in');
    if (!tableOrders['walk-in']) {
      setTableOrders({
        ...tableOrders,
        'walk-in': { items: [], kotSent: false, firstKotDone: false },
      });
    }
  };

  const handleReservationClick = () => {
    setShowReservationModal(true);
  };

  const handleReservationSubmit = async () => {
    if (!reservationData.customerName || !reservationData.customerPhone || !reservationData.reservationDate || !reservationData.reservationTime) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const reservationDateTime = `${reservationData.reservationDate}T${reservationData.reservationTime}`;
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: reservationData.customerName,
          customerPhone: reservationData.customerPhone,
          guestCount: reservationData.guestCount,
          reservationTime: reservationDateTime,
        }),
      });

      if (response.ok) {
        alert(`Reservation confirmed for ${reservationData.customerName} on ${reservationData.reservationDate} at ${reservationData.reservationTime}`);
        setShowReservationModal(false);
        setReservationData({
          customerName: '',
          customerPhone: '',
          guestCount: 2,
          reservationDate: '',
          reservationTime: '',
        });
      } else {
        alert('Failed to create reservation');
      }
    } catch (err) {
      console.error('Error creating reservation:', err);
      alert('Error creating reservation');
    }
  };

  const handleBackToTables = () => {
    setSelectedTableId(null);
    setIsPaymentModalOpen(false);
  };

  const handleAddMenuItem = (menuItem: MenuItem) => {
    if (!selectedTableId) return;

    const currentOrders = tableOrders[selectedTableId] || { items: [], kotSent: false, firstKotDone: false };
    const existingItem = currentOrders.items.find(item => item.menuItemId === menuItem.id);

    let updatedItems;
    if (existingItem) {
      updatedItems = currentOrders.items.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedItems = [...currentOrders.items, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        sentToKOT: false,
      }];
    }

    setTableOrders({
      ...tableOrders,
      [selectedTableId]: {
        ...currentOrders,
        items: updatedItems,
      },
    });
  };

  const handleUpdateQuantity = (menuItemId: string, change: number) => {
    if (!selectedTableId) return;

    const currentOrders = tableOrders[selectedTableId];
    const updatedItems = currentOrders.items.map(item => {
      if (item.menuItemId === menuItemId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0);

    setTableOrders({
      ...tableOrders,
      [selectedTableId]: {
        ...currentOrders,
        items: updatedItems,
      },
    });
  };

  const handleSendToKOT = async () => {
    if (!selectedTableId || !currentTableOrders) return;

    try {
      const kotNumber = kotCounter + 1;
      const kotData = {
        kotNumber,
        tableNumber: selectedTableId === 'walk-in' ? 'Walk-in' : `Table ${currentTableData?.number || selectedTableId}`,
        items: currentTableOrders.items.filter(item => !item.sentToKOT),
        timestamp: new Date(),
      };

      // Send to KOT API
      const response = await fetch('/api/kot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kotData),
      });

      if (response.ok) {
        // Mark items as sent to KOT
        const updatedItems = currentTableOrders.items.map(item => ({ ...item, sentToKOT: true }));

        setTableOrders({
          ...tableOrders,
          [selectedTableId]: {
            ...currentTableOrders,
            items: updatedItems,
            kotSent: true,
            firstKotDone: true,
          },
        });

        setKotLogs([...kotLogs, kotData]);
        setKotCounter(kotNumber);
        alert(`KOT #${kotNumber} sent to kitchen!`);
      }
    } catch (err) {
      console.error('Error sending to KOT:', err);
      alert('Failed to send to kitchen');
    }
  };

  const handlePayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handleCompletePayment = async () => {
    if (!selectedTableId || !currentTableOrders) return;

    const { total } = calculateBillTotal(currentTableOrders.items, discountAmount, roundOffAmount);

    try {
      const orderData = {
        tableId: selectedTableId,
        items: currentTableOrders.items,
        subtotal: calculateBillTotal(currentTableOrders.items).subtotal,
        tax: calculateBillTotal(currentTableOrders.items).tax,
        discount: discountAmount,
        roundOff: roundOffAmount,
        total,
        paymentMode,
        cashAmount: paymentMode === 'split' ? cashAmount : (paymentMode === 'cash' ? total : 0),
        onlineAmount: paymentMode === 'split' ? onlineAmount : (paymentMode !== 'cash' ? total : 0),
        timestamp: new Date(),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        // Clear table order
        const updatedTableOrders = { ...tableOrders };
        delete updatedTableOrders[selectedTableId];

        // Reset table status
        if (selectedTableId !== 'walk-in') {
          setTables(tables.map(t =>
            t.id === selectedTableId ? { ...t, status: 'available' } : t
          ));
        }

        setTableOrders(updatedTableOrders);
        setIsPaymentModalOpen(false);
        setSelectedTableId(null);

        // Reset payment modal
        setDiscountAmount(0);
        setRoundOffAmount(0);
        setPaymentMode('cash');
        setCashAmount(0);
        setOnlineAmount(0);

        alert('Payment completed successfully!');
      }
    } catch (err) {
      console.error('Error completing payment:', err);
      alert('Failed to complete payment');
    }
  };

  // ==================== Render ====================
  if (selectedTableId) {
    // Full-screen POS interface
    const { subtotal, tax, total } = calculateBillTotal(currentTableOrders?.items || [], discountAmount, roundOffAmount);

    return (
      <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b-2 border-slate-200 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToTables}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {selectedTableId === 'walk-in' ? 'Walk-in Order' : `Table ${currentTableData?.number || selectedTableId}`}
              </h1>
              <p className="text-sm text-slate-600">
                {currentTableOrders?.items.length || 0} items • ₹{total.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSendToKOT}
              disabled={!currentTableOrders?.items.some(item => !item.sentToKOT)}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChefHat size={20} className="inline mr-2" />
              Send to KOT
            </button>

            <button
              onClick={handlePayment}
              disabled={!currentTableOrders?.items.length}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💰 Payment
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Menu Section */}
          <div className="w-2/3 bg-white p-6 overflow-y-auto">
            {/* Search and Filter */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMenuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleAddMenuItem(item)}
                  className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all text-left"
                >
                  <h3 className="font-bold text-slate-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">₹{item.price}</p>
                  {item.description && (
                    <p className="text-xs text-slate-500">{item.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-1/3 bg-slate-50 border-l-2 border-slate-200 p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h2>

            {/* Order Items */}
            <div className="space-y-3 mb-6">
              {currentTableOrders?.items.map(item => (
                <div key={item.menuItemId} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{item.name}</h4>
                    <p className="text-sm text-slate-600">₹{item.price}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.menuItemId, -1)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center font-bold"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="w-8 text-center font-bold">{item.quantity}</span>

                    <button
                      onClick={() => handleUpdateQuantity(item.menuItemId, 1)}
                      className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-full flex items-center justify-center font-bold"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="bg-white p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (10%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Round off:</span>
                <span>₹{roundOffAmount.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Complete Payment</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="split">Split Payment</option>
                  </select>
                </div>

                {paymentMode === 'split' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Cash Amount</label>
                      <input
                        type="number"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Online Amount</label>
                      <input
                        type="number"
                        value={onlineAmount}
                        onChange={(e) => setOnlineAmount(Number(e.target.value))}
                        className="w-full p-2 border rounded-lg"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompletePayment}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                  >
                    Complete Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Tables view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">🍽️ Point of Sale</h1>
        <p className="text-lg text-slate-600">Select a table or create a walk-in order</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={handleWalkInClick}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl"
        >
          👤 Walk In
        </button>

        <button
          onClick={handleReservationClick}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl"
        >
          📅 Reservation
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => handleTableClick(table.id)}
            disabled={table.status === 'reserved'}
            className={`
              aspect-square rounded-xl p-6 text-left transition-all duration-200 shadow-lg hover:shadow-2xl
              ${table.status === 'available'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : table.status === 'occupied'
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : table.status === 'reserved'
                ? 'bg-purple-500 text-white cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
            `}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <h3 className="text-xl font-bold mb-1">
                  {table.tableName || `Table ${table.number}`}
                </h3>
                <p className="text-sm opacity-90">
                  {table.capacity} seats
                </p>
              </div>

              {table.status === 'reserved' && table.reservation && (
                <div className="text-xs opacity-90 mt-2">
                  <p>Reserved for {table.reservation.customerName}</p>
                  <p>{table.reservation.date} at {table.reservation.time}</p>
                </div>
              )}

              <div className="text-right">
                <span className="text-2xl font-bold">
                  {table.status === 'available' ? '✓' :
                   table.status === 'occupied' ? '👥' :
                   table.status === 'reserved' ? '📅' : '⏸️'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Make Reservation</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Customer Name</label>
                <input
                  type="text"
                  value={reservationData.customerName}
                  onChange={(e) => setReservationData({...reservationData, customerName: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={reservationData.customerPhone}
                  onChange={(e) => setReservationData({...reservationData, customerPhone: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={reservationData.reservationDate}
                    onChange={(e) => setReservationData({...reservationData, reservationDate: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Time</label>
                  <input
                    type="time"
                    value={reservationData.reservationTime}
                    onChange={(e) => setReservationData({...reservationData, reservationTime: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  value={reservationData.guestCount}
                  onChange={(e) => setReservationData({...reservationData, guestCount: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReservationModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReservationSubmit}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg"
                >
                  Reserve Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  const handleRemoveMenuItem = (menuItemId: string) => {
    if (!selectedTableId) return;

    setTableOrders(prev => {
      const orders = prev[selectedTableId] || { items: [], kotSent: false, firstKotDone: false };
      const itemIndex = orders.items.findIndex(item => item.menuItemId === menuItemId);

      if (itemIndex > -1) {
        if (orders.items[itemIndex].quantity > 1) {
          orders.items[itemIndex].quantity -= 1;
        } else {
          orders.items.splice(itemIndex, 1);
        }
      }

      return {
        ...prev,
        [selectedTableId]: orders,
      };
    });
  };

  const handleSendKOT = () => {
    if (!selectedTableId || !currentTableOrders) return;

    const itemsToKOT = currentTableOrders.items.filter(item => !item.sentToKOT);
    if (itemsToKOT.length === 0) return;

    setTableOrders(prev => {
      const orders = prev[selectedTableId!] || { items: [], kotSent: false, firstKotDone: false };
      orders.items.forEach(item => {
        item.sentToKOT = true;
      });
      orders.kotSent = true;
      orders.firstKotDone = true;

      return {
        ...prev,
        [selectedTableId!]: orders,
      };
    });

    const newKotNumber = kotCounter + 1;
    setKotCounter(newKotNumber);
    setKotLogs(prev => [
      ...prev,
      {
        kotNumber: newKotNumber,
        tableNumber: selectedTableId === 'walk-in' ? 'Walk-in' : `${currentTableData?.tableName || 'Table'}`,
        items: itemsToKOT,
        timestamp: new Date(),
      },
    ]);
  };

  const handleCancelOrder = () => {
    if (!selectedTableId) return;

    setTableOrders(prev => {
      const newOrders = { ...prev };
      delete newOrders[selectedTableId];
      return newOrders;
    });

    if (selectedTableId !== 'walk-in') {
      setTables(tables.map(t => (t.id === selectedTableId ? { ...t, status: 'available' } : t)));
    }

    handleBackToTables();
  };

  const handleCompletePayment = () => {
    if (!selectedTableId || !currentTableOrders) return;

    setIsPaymentModalOpen(false);

    setTableOrders(prev => {
      const newOrders = { ...prev };
      delete newOrders[selectedTableId];
      return newOrders;
    });

    if (selectedTableId !== 'walk-in') {
      setTables(tables.map(t => (t.id === selectedTableId ? { ...t, status: 'available' } : t)));
    }

    handleBackToTables();
    setDiscountAmount(0);
    setRoundOffAmount(0);
    setCashAmount(0);
    setOnlineAmount(0);
  };

  // ==================== JSX ====================

  // FULL-SCREEN ORDER FORM VIEW
  if (showOrderForm && selectedTableId) {
    const { subtotal, tax, total } = currentTableOrders 
      ? calculateBillTotal(currentTableOrders.items, discountAmount, roundOffAmount)
      : { subtotal: 0, tax: 0, total: 0 };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex flex-col">
        {/* Full-Screen Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6 flex justify-between items-center shadow-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToTables}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {selectedTableId === 'walk-in' ? 'Walk-in Order' : currentTableData?.tableName || 'Order'}
              </h1>
              <p className="text-emerald-100 text-sm mt-1">Capacity: {currentTableData?.capacity || '-'} people</p>
            </div>
          </div>
        </div>

        {/* Main Content - Full Width */}
        <div className="flex-1 overflow-auto flex">
          {/* Left Side - Menu (70%) */}
          <div className="flex-1 p-8 overflow-auto">
            {/* Search and Categories */}
            <div className="mb-8 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors text-lg"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex gap-3 overflow-x-auto pb-2 flex-wrap">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-lg whitespace-nowrap font-semibold transition-all duration-200 text-lg ${
                      selectedCategory === category
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid - Square Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredMenuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleAddMenuItem(item)}
                  className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 hover:border-emerald-500 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 group flex flex-col justify-between"
                >
                  <div className="text-left">
                    <h3 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors text-base">{item.name}</h3>
                    {item.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-emerald-400 font-bold text-lg">₹{item.price}</span>
                    <div className="p-2 bg-emerald-600 group-hover:bg-emerald-500 rounded-lg transition-colors">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Bill Preview (30%) */}
          <div className="w-1/3 bg-slate-950 border-l-2 border-slate-700 flex flex-col p-6 shadow-2xl">
            {/* Bill Header */}
            <h2 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
              <Printer className="w-6 h-6" />
              Order Summary
            </h2>

            {currentTableOrders && currentTableOrders.items.length > 0 ? (
              <>
                {/* Items List */}
                <div className="flex-1 min-h-0 overflow-auto mb-6 space-y-3">
                  {currentTableOrders.items.map(item => (
                    <div
                      key={item.menuItemId}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex justify-between items-center group hover:border-emerald-500 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-100">{item.name}</p>
                        <p className="text-xs text-slate-400">₹{item.price} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemoveMenuItem(item.menuItemId)}
                          className="p-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </button>
                        <span className="text-emerald-400 font-bold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleAddMenuItem(SAMPLE_MENU_ITEMS.find(m => m.id === item.menuItemId)!)}
                          className="p-1 bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-bold text-emerald-400">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Calculation */}
                <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-5 space-y-3 mb-6">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tax (10%)</span>
                    <span className="font-semibold">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pb-3 border-b border-slate-700">
                    <span>Round Off</span>
                    <span className="font-semibold">+₹{roundOffAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 text-xl font-bold pt-2">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons - Square Style */}
                <div className="space-y-3">
                  <button
                    onClick={handleSendKOT}
                    disabled={!currentTableOrders.items.some(item => !item.sentToKOT) || currentTableOrders.kotSent}
                    className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 ${
                      !currentTableOrders.items.some(item => !item.sentToKOT) || currentTableOrders.kotSent
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-xl'
                    }`}
                  >
                    <ChefHat className="w-6 h-6" />
                    KOT {currentTableOrders.firstKotDone ? '(Done)' : ''}
                  </button>

                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    disabled={!currentTableOrders.kotSent}
                    className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 ${
                      !currentTableOrders.kotSent
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-xl'
                    }`}
                  >
                    <Check className="w-6 h-6" />
                    Process Payment
                  </button>

                  <button
                    onClick={handleCancelOrder}
                    className="w-full py-4 rounded-lg font-bold text-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-200 shadow-xl"
                  >
                    Cancel Order
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-500 text-center text-lg">No items added yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {isPaymentModalOpen && selectedTableId && currentTableOrders && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-2xl max-h-96 overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-emerald-400">Payment Options</h2>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-7 h-7 text-slate-300" />
                </button>
              </div>

              {(() => {
                const { subtotal, tax, total } = calculateBillTotal(currentTableOrders.items, discountAmount, roundOffAmount);
                return (
                  <div className="space-y-6">
                    {/* Total Display */}
                    <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-6 text-center">
                      <p className="text-slate-400 mb-2">Total Amount</p>
                      <p className="text-5xl font-bold text-emerald-400">₹{total.toFixed(2)}</p>
                    </div>

                    {/* Payment Mode Selection */}
                    <div className="space-y-4">
                      <p className="font-bold text-slate-300 text-xl">Select Payment Mode:</p>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { mode: 'cash', label: '💵 Cash' },
                          { mode: 'card', label: '💳 Card' },
                          { mode: 'upi', label: '📱 UPI' },
                          { mode: 'split', label: '♻️ Split Payment' },
                        ].map(({ mode, label }) => (
                          <button
                            key={mode}
                            onClick={() => {
                              setPaymentMode(mode as any);
                              if (mode !== 'split') {
                                setCashAmount(0);
                                setOnlineAmount(0);
                              }
                            }}
                            className={`py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                              paymentMode === mode
                                ? 'bg-emerald-600 text-white shadow-xl'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-2 border-slate-700'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Split Payment Form */}
                    {paymentMode === 'split' && (
                      <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-6 space-y-4">
                        <div>
                          <label className="text-slate-300 font-semibold block mb-2">Cash Amount (₹)</label>
                          <input
                            type="number"
                            value={cashAmount}
                            onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 transition-colors"
                            placeholder="Enter cash amount"
                          />
                        </div>
                        <div>
                          <label className="text-slate-300 font-semibold block mb-2">Online Amount (₹)</label>
                          <input
                            type="number"
                            value={onlineAmount}
                            onChange={(e) => setOnlineAmount(parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 transition-colors"
                            placeholder="Enter online amount"
                          />
                        </div>
                        <p className="text-slate-400">
                          Total Split: ₹{(cashAmount + onlineAmount).toFixed(2)} / ₹{total.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {/* Discount and Round Off */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-300 font-semibold block mb-2">Discount (₹)</label>
                        <input
                          type="number"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 transition-colors"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-semibold block mb-2">Round Off (₹)</label>
                        <input
                          type="number"
                          value={roundOffAmount}
                          onChange={(e) => setRoundOffAmount(parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-emerald-500 transition-colors"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Confirm Payment Button */}
                    <button
                      onClick={handleCompletePayment}
                      className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-lg rounded-lg transition-all duration-200 shadow-xl"
                    >
                      ✓ Confirm Payment
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== TABLES GRID VIEW ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-white mb-2">🍽️ POS System</h1>
        <p className="text-slate-400 text-xl">Select a table to place an order</p>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* Tables */}
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => handleTableClick(table.id)}
            className={`aspect-square rounded-xl border-3 p-6 transition-all duration-300 flex flex-col items-center justify-center font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 ${
              table.status === 'available'
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white hover:from-emerald-600 hover:to-emerald-700'
                : table.status === 'occupied'
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 text-white hover:from-orange-600 hover:to-orange-700 cursor-not-allowed'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 text-white hover:from-blue-600 hover:to-blue-700'
            }`}
            disabled={table.status !== 'available'}
          >
            <div className="text-3xl mb-2">{table.status === 'available' ? '▢' : '■'}</div>
            <div className="text-center">
              <p className="text-xl">{table.tableName}</p>
              <p className="text-xs opacity-80">{table.status.charAt(0).toUpperCase() + table.status.slice(1)}</p>
            </div>
          </button>
        ))}

        {/* Walk-in Button */}
        <button
          onClick={handleWalkInClick}
          className="aspect-square rounded-xl border-3 border-purple-400 bg-gradient-to-br from-purple-500 to-purple-600 p-6 transition-all duration-300 flex flex-col items-center justify-center font-bold text-lg text-white shadow-xl hover:shadow-2xl transform hover:scale-105 hover:from-purple-600 hover:to-purple-700"
        >
          <div className="text-3xl mb-2">👤</div>
          <p className="text-xl text-center">Walk-in</p>
          <p className="text-xs opacity-80">No Table</p>
        </button>

        {/* Reservation Button */}
        <button
          onClick={handleReservationClick}
          className="aspect-square rounded-xl border-3 border-pink-400 bg-gradient-to-br from-pink-500 to-pink-600 p-6 transition-all duration-300 flex flex-col items-center justify-center font-bold text-lg text-white shadow-xl hover:shadow-2xl transform hover:scale-105 hover:from-pink-600 hover:to-pink-700"
        >
          <div className="text-3xl mb-2">📅</div>
          <p className="text-xl text-center">Reservation</p>
          <p className="text-xs opacity-80">Book Table</p>
        </button>
      </div>

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-gradient-to-r from-pink-600 to-pink-700 px-8 py-6 flex justify-between items-center rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">📅 Make Reservation</h2>
              <button
                onClick={() => setShowReservationModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-2">Customer Name</label>
                <input
                  type="text"
                  value={reservationData.customerName}
                  onChange={(e) => setReservationData({...reservationData, customerName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-pink-500 transition-colors"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={reservationData.customerPhone}
                  onChange={(e) => setReservationData({...reservationData, customerPhone: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-pink-500 transition-colors"
                  placeholder="Enter phone"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-2">Number of Guests</label>
                <input
                  type="number"
                  value={reservationData.guestCount}
                  onChange={(e) => setReservationData({...reservationData, guestCount: parseInt(e.target.value) || 2})}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-pink-500 transition-colors"
                  min="1"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-2">Date</label>
                <input
                  type="date"
                  value={reservationData.reservationDate}
                  onChange={(e) => setReservationData({...reservationData, reservationDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-pink-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-slate-300 font-semibold block mb-2">Time</label>
                <input
                  type="time"
                  value={reservationData.reservationTime}
                  onChange={(e) => setReservationData({...reservationData, reservationTime: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-pink-500 transition-colors"
                />
              </div>
              <p className="text-slate-400 text-sm">⏱️ Table will be reserved for 20 minutes before the booking time</p>
              <button
                onClick={handleReservationSubmit}
                className="w-full py-3 mt-6 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-bold rounded-lg transition-all duration-200 shadow-xl"
              >
                ✓ Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
