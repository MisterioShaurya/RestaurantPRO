'use client';

import React, { useState, useMemo } from 'react';
import { X, Plus, Minus, Check, ChefHat, Trash2, Settings2, Search, Printer } from 'lucide-react';

// ==================== Interfaces ====================
interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'on-hold';
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
  const [tables, setTables] = useState<Table[]>(
    Array.from({ length: 12 }, (_, i) => ({
      id: `table-${i + 1}`,
      number: i + 1,
      capacity: 4,
      status: 'available' as const,
    }))
  );

  const [tableOrders, setTableOrders] = useState<Record<string, TableOrderState>>({});
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isManageTablesOpen, setIsManageTablesOpen] = useState(false);
  const [kotLogs, setKotLogs] = useState<KOTLog[]>([]);
  const [kotCounter, setKotCounter] = useState(0);

  // Menu search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Payment modal state
  const [discountAmount, setDiscountAmount] = useState(0);
  const [roundOffAmount, setRoundOffAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'upi' | 'cheque'>('cash');

  // Manage tables state
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');

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
  const currentTableData = selectedTableId ? tables.find(t => t.id === selectedTableId) : null;

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
      // Set table to occupied and open modal
      setTables(tables.map(t => (t.id === tableId ? { ...t, status: 'occupied' } : t)));
    }

    setSelectedTableId(tableId);
    setIsOrderModalOpen(true);
  };

  const handleWalkInClick = () => {
    setSelectedTableId('walk-in');
    // Initialize walk-in order if not exists
    if (!tableOrders['walk-in']) {
      setTableOrders({
        ...tableOrders,
        'walk-in': { items: [], kotSent: false, firstKotDone: false },
      });
    }
    setIsOrderModalOpen(true);
  };

  const handleCloseModal = () => {
    if (selectedTableId && selectedTableId !== 'walk-in') {
      // Set table to on-hold when closing modal
      setTables(tables.map(t => (t.id === selectedTableId ? { ...t, status: 'on-hold' } : t)));
    }
    setIsOrderModalOpen(false);
  };

  const handleAddMenuItem = (menuItem: MenuItem) => {
    if (!selectedTableId) return;

    setTableOrders(prev => {
      const orders = prev[selectedTableId] || { items: [], kotSent: false, firstKotDone: false };
      const existingItem = orders.items.find(item => item.menuItemId === menuItem.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        orders.items.push({
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          sentToKOT: false,
        });
      }

      return {
        ...prev,
        [selectedTableId]: orders,
      };
    });
  };

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

    // Mark items as sent to KOT
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

    // Add to KOT logs
    const newKotNumber = kotCounter + 1;
    setKotCounter(newKotNumber);
    setKotLogs(prev => [
      ...prev,
      {
        kotNumber: newKotNumber,
        tableNumber: selectedTableId === 'walk-in' ? 'Walk-in' : `Table ${currentTableData?.number}`,
        items: itemsToKOT,
        timestamp: new Date(),
      },
    ]);
  };

  const handleCancelOrder = () => {
    if (!selectedTableId) return;

    // Clear the order
    setTableOrders(prev => {
      const newOrders = { ...prev };
      delete newOrders[selectedTableId];
      return newOrders;
    });

    // Reset table to available
    if (selectedTableId !== 'walk-in') {
      setTables(tables.map(t => (t.id === selectedTableId ? { ...t, status: 'available' } : t)));
    }

    setIsOrderModalOpen(false);
    setSelectedTableId(null);
  };

  const handleCompletePayment = () => {
    if (!selectedTableId || !currentTableOrders) return;

    setIsPaymentModalOpen(false);
    setKotLogs([]);
    setKotCounter(0);

    // Reset table
    if (selectedTableId !== 'walk-in') {
      setTables(tables.map(t => (t.id === selectedTableId ? { ...t, status: 'available' } : t)));
    }

    // Clear orders
    setTableOrders(prev => {
      const newOrders = { ...prev };
      delete newOrders[selectedTableId];
      return newOrders;
    });

    setIsOrderModalOpen(false);
    setSelectedTableId(null);
    setDiscountAmount(0);
    setRoundOffAmount(0);
  };

  const handleAddTable = () => {
    if (!newTableNumber || !newTableCapacity) return;

    const newId = `table-${Date.now()}`;
    setTables([
      ...tables,
      {
        id: newId,
        number: parseInt(newTableNumber),
        capacity: parseInt(newTableCapacity),
        status: 'available',
      },
    ]);

    setNewTableNumber('');
    setNewTableCapacity('4');
    setIsManageTablesOpen(false);
  };

  const handleDeleteTable = (tableId: string) => {
    setTables(tables.filter(t => t.id !== tableId));
  };

  // ==================== JSX ====================
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl font-bold text-emerald-400">Restaurant POS</h1>
          </div>
          <button
            onClick={() => setIsManageTablesOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg text-sm font-semibold transition-all duration-200"
          >
            <Settings2 className="w-4 h-4" />
            Manage Tables
          </button>
        </div>

        {/* Tables Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Tables Grid */}
            {tables.map(table => (
              <div
                key={table.id}
                onClick={() => handleTableClick(table.id)}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  table.status === 'available'
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20'
                    : table.status === 'occupied'
                      ? 'bg-gradient-to-br from-orange-900/30 to-slate-900 border-orange-500 shadow-lg shadow-orange-500/20'
                      : 'bg-gradient-to-br from-emerald-900/30 to-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/20'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">Table {table.number}</h3>
                    <p className="text-sm text-slate-400">Capacity: {table.capacity}</p>
                  </div>
                  {selectedTableId === table.id && isOrderModalOpen && (
                    <Trash2
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteTable(table.id);
                      }}
                      className="w-5 h-5 text-red-400 hover:text-red-300 cursor-pointer transition-colors"
                    />
                  )}
                </div>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    table.status === 'available'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : table.status === 'occupied'
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-blue-500/20 text-blue-300'
                  }`}
                >
                  {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </div>
              </div>
            ))}

            {/* Walk-in Section */}
            <div
              onClick={handleWalkInClick}
              className="p-6 rounded-xl border-2 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer transition-all duration-200"
            >
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Plus className="w-8 h-8 text-orange-400" />
                <h3 className="text-lg font-bold text-slate-100">Walk-in Order</h3>
                <p className="text-sm text-slate-400 text-center">Quick orders without table</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Bill Preview & KOT Logs */}
      <div className="w-96 bg-gradient-to-b from-slate-900 to-slate-950 border-l border-slate-700 flex flex-col">
        {/* KOT Logs Section */}
        <div className="flex-1 overflow-auto border-b border-slate-700 p-4">
          <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            KOT Logs
          </h2>
          <div className="space-y-3">
            {kotLogs.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No KOT logs yet</p>
            ) : (
              kotLogs.map(log => (
                <div key={`${log.tableNumber}-${log.kotNumber}`} className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-emerald-400">KOT #{log.kotNumber}</span>
                    <span className="text-slate-400">{log.tableNumber}</span>
                  </div>
                  <div className="text-slate-300 text-xs space-y-1 mb-2">
                    {log.items.map(item => (
                      <div key={item.menuItemId} className="flex justify-between">
                        <span>{item.name}</span>
                        <span className="text-slate-400">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs">{log.timestamp.toLocaleTimeString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bill Preview Section */}
        <div className="p-4 border-t border-slate-700">
          <h2 className="text-lg font-bold text-emerald-400 mb-4">Bill Preview</h2>
          {currentTableOrders && currentTableOrders.items.length > 0 ? (
            <div className="space-y-4">
              {/* Items List */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 max-h-48 overflow-auto">
                {currentTableOrders.items.map(item => (
                  <div key={item.menuItemId} className="flex justify-between items-center text-sm mb-2 pb-2 border-b border-slate-700 last:border-0 last:mb-0">
                    <div className="flex-1">
                      <p className="text-slate-100">{item.name}</p>
                      <p className="text-slate-400 text-xs">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-100 font-semibold">{item.quantity}</span>
                      <span className="text-emerald-400">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Calculation */}
              {(() => {
                const { subtotal, tax, total } = calculateBillTotal(currentTableOrders.items, discountAmount, roundOffAmount);
                return (
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Tax (10%)</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Discount</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Round Off</span>
                      <span>+₹{roundOffAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-700 pt-2">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleSendKOT}
                  disabled={!currentTableOrders.items.some(item => !item.sentToKOT) || currentTableOrders.kotSent}
                  className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                    !currentTableOrders.items.some(item => !item.sentToKOT) || currentTableOrders.kotSent
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white'
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                  KOT {currentTableOrders.firstKotDone ? '(Done)' : ''}
                </button>

                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={!currentTableOrders.kotSent}
                  className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                    !currentTableOrders.kotSent
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Complete & Pay
                </button>

                <button
                  onClick={handleCancelOrder}
                  className="w-full py-2 rounded-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-200"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-8">No items added</p>
          )}
        </div>
      </div>

      {/* Order Modal */}
      {isOrderModalOpen && selectedTableId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-11/12 max-w-4xl max-h-96 flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-emerald-400">
                {selectedTableId === 'walk-in' ? 'Walk-in Order' : `Table ${currentTableData?.number} - Order`}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-100 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex flex-col">
              {/* Search and Categories */}
              <div className="p-4 border-b border-slate-700 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items Grid */}
              <div className="p-4 grid grid-cols-3 gap-3 overflow-auto">
                {filteredMenuItems.map(item => (
                  <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3 hover:border-emerald-500 transition-colors cursor-pointer group">
                    <div className="mb-2">
                      <h3 className="font-semibold text-slate-100 text-sm group-hover:text-emerald-400 transition-colors">{item.name}</h3>
                      {item.description && <p className="text-xs text-slate-400 truncate">{item.description}</p>}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-bold">₹{item.price}</span>
                      <button
                        onClick={() => handleAddMenuItem(item)}
                        className="p-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded text-white transition-all duration-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedTableId && currentTableOrders && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-96 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-emerald-400">Payment</h2>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {(() => {
              const { subtotal, tax, total } = calculateBillTotal(currentTableOrders.items, discountAmount, roundOffAmount);
              return (
                <div className="space-y-4">
                  {/* Bill Summary */}
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Tax (10%)</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Discount</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Round Off</span>
                      <span>+₹{roundOffAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-700 pt-2">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Discount Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Discount (₹)</label>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={e => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Round Off Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Round Off (₹)</label>
                    <input
                      type="number"
                      value={roundOffAmount}
                      onChange={e => setRoundOffAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Payment Mode */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={e => setPaymentMode(e.target.value as 'cash' | 'card' | 'upi' | 'cheque')}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="flex-1 py-2 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-slate-100 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCompletePayment}
                      className="flex-1 py-2 rounded-lg font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print & Complete
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Manage Tables Modal */}
      {isManageTablesOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-96 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-emerald-400">Manage Tables</h2>
              <button
                onClick={() => setIsManageTablesOpen(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-auto mb-4">
              {/* Existing Tables */}
              {tables.map(table => (
                <div key={table.id} className="flex justify-between items-center bg-slate-800 border border-slate-700 rounded-lg p-3">
                  <div>
                    <p className="font-semibold text-slate-100">Table {table.number}</p>
                    <p className="text-sm text-slate-400">Capacity: {table.capacity}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Table */}
            <div className="border-t border-slate-700 pt-4 space-y-3">
              <h3 className="font-semibold text-slate-300">Add New Table</h3>
              <input
                type="number"
                placeholder="Table Number"
                value={newTableNumber}
                onChange={e => setNewTableNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <input
                type="number"
                placeholder="Capacity"
                value={newTableCapacity}
                onChange={e => setNewTableCapacity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setIsManageTablesOpen(false)}
                  className="flex-1 py-2 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-slate-100 transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={handleAddTable}
                  className="flex-1 py-2 rounded-lg font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white transition-all duration-200"
                >
                  Add Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
