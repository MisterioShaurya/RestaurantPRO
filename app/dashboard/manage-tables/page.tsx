'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Trash2, Edit2, Settings } from 'lucide-react'

interface Table {
  _id: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'on-hold'
  isDefault?: boolean
  tableName?: string
}

export default function ManageTablesPage() {
  const router = useRouter()
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [showTableForm, setShowTableForm] = useState(false)
  const [newTableNum, setNewTableNum] = useState<number>(0)
  const [newTableCapacity, setNewTableCapacity] = useState<number>(2)
  const [newTableName, setNewTableName] = useState<string>('')
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [editTableName, setEditTableName] = useState<string>('')
  
  // Bulk table creation
  const [bulkTableCount, setBulkTableCount] = useState<number>(1)
  const [bulkStartNumber, setBulkStartNumber] = useState<number>(1)
  const [bulkCapacity, setBulkCapacity] = useState<number>(4)
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false)

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
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
      console.error('[ManageTables] Error loading tables:', err)
      alert('Failed to load tables. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const createTable = async () => {
    if (newTableNum <= 0) {
      alert('Please enter a valid table number')
      return
    }

    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: newTableNum,
          capacity: newTableCapacity,
          tableName: newTableName || `Table ${newTableNum}`,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setTables([...tables, data.table])
        setNewTableNum(0)
        setNewTableCapacity(2)
        setNewTableName('')
        setShowTableForm(false)
        alert('Table created successfully!')
      }
    } catch (err) {
      console.log('Error creating table:', err)
      alert('Failed to create table')
    }
  }

  const createBulkTables = async () => {
    if (bulkTableCount <= 0 || bulkStartNumber <= 0) {
      alert('Please enter valid values for table count and start number')
      return
    }

    // Check for duplicate table numbers
    const existingNumbers = tables.map(t => t.number)
    const newNumbers = Array.from({ length: bulkTableCount }, (_, i) => bulkStartNumber + i)
    const duplicates = newNumbers.filter(n => existingNumbers.includes(n))
    
    if (duplicates.length > 0) {
      alert(`Table numbers already exist: ${duplicates.join(', ')}. Please choose different numbers.`)
      return
    }

    try {
      const tablesToCreate = newNumbers.map(num => ({
        number: num,
        capacity: bulkCapacity,
        tableName: `Table ${num}`,
      }))

      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables: tablesToCreate }),
      })

      if (res.ok) {
        const data = await res.json()
        setTables([...tables, ...data.tables])
        setBulkTableCount(1)
        setBulkStartNumber(1)
        setBulkCapacity(4)
        setIsBulkMode(false)
        setShowTableForm(false)
        alert(`${data.tables.length} tables created successfully!`)
      }
    } catch (err) {
      console.log('Error creating bulk tables:', err)
      alert('Failed to create tables')
    }
  }

  const deleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setTables(tables.filter((t) => t._id !== tableId))
        alert('Table deleted successfully!')
      }
    } catch (err) {
      console.log('Error deleting table:', err)
      alert('Failed to delete table')
    }
  }

  const editTable = (table: Table) => {
    setEditingTable(table)
    setEditTableName(table.tableName || `Table ${table.number}`)
  }

  const saveTableName = async () => {
    if (!editingTable || !editTableName.trim()) {
      alert('Please enter a valid table name')
      return
    }

    try {
      const res = await fetch('/api/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: editingTable._id,
          tableName: editTableName.trim()
        })
      })

      if (res.ok) {
        const data = await res.json()
        // Update local state with the returned data from database
        if (data.table) {
          setTables(tables.map(t => 
            t._id === editingTable._id 
              ? data.table
              : t
          ))
        } else {
          setTables(tables.map(t => 
            t._id === editingTable._id 
              ? { ...t, tableName: editTableName.trim() }
              : t
          ))
        }
        setEditingTable(null)
        setEditTableName('')
        alert('Table name updated successfully!')
      }
    } catch (err) {
      console.log('Error updating table name:', err)
      alert('Failed to update table name')
    }
  }

  const cancelEdit = () => {
    setEditingTable(null)
    setEditTableName('')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-orange-100 border-orange-400 text-orange-700'
      case 'on-hold':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700'
      case 'available':
        return 'bg-emerald-100 border-emerald-400 text-emerald-700'
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="text-blue-600" size={36} />
              Manage Tables
            </h1>
            <p className="text-lg text-gray-600">Add, edit, or remove restaurant tables</p>
          </div>
        </div>
      </div>

      {/* Add Table Section */}
      <div className="bg-white rounded-2xl card-shadow p-6 mb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Add New Table</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsBulkMode(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${!isBulkMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Single
            </button>
            <button
              onClick={() => setIsBulkMode(true)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${isBulkMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Bulk
            </button>
          </div>
        </div>
        
        {!isBulkMode ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Table Number</label>
                <input
                  type="number"
                  placeholder="e.g., 1, 2, 3"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(parseInt(e.target.value) || 0)}
                  className="w-full bg-white text-black px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Table Name</label>
                <input
                  type="text"
                  placeholder="e.g., VIP Table"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full bg-white text-black px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Seats</label>
                <input
                  type="number"
                  placeholder="e.g., 4"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 2)}
                  className="w-full bg-white text-black px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </div>
            </div>
            <button
              onClick={createTable}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition shadow-md active:scale-95 font-semibold"
            >
              Create Table
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Number of Tables</label>
                <input
                  type="number"
                  placeholder="e.g., 5"
                  value={bulkTableCount}
                  onChange={(e) => setBulkTableCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white text-black px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Start Number</label>
                <input
                  type="number"
                  placeholder="e.g., 1"
                  value={bulkStartNumber}
                  onChange={(e) => setBulkStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white text-black px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Seats per Table</label>
                <input
                  type="number"
                  placeholder="e.g., 4"
                  value={bulkCapacity}
                  onChange={(e) => setBulkCapacity(Math.max(1, parseInt(e.target.value) || 4))}
                  className="w-full bg-white text-black px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none"
                  min="1"
                />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                <strong>Preview:</strong> Will create tables {bulkStartNumber} to {bulkStartNumber + bulkTableCount - 1} ({bulkTableCount} tables with {bulkCapacity} seats each)
              </p>
            </div>
            <button
              onClick={createBulkTables}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition shadow-md active:scale-95 font-semibold"
            >
              Create {bulkTableCount} Tables
            </button>
          </div>
        )}
      </div>

      {/* Tables Grid */}
      <div className="bg-white rounded-2xl card-shadow p-6 animate-slide-up">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Tables ({tables.length})</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tables...</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tables found. Create your first table above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {tables.map((table) => (
              <div
                key={table._id}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${getStatusColor(table.status)}`}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{table.number}</div>
                  {table.tableName && (
                    <div className="text-sm font-semibold mb-2 truncate">
                      📍 {table.tableName}
                    </div>
                  )}
                  <div className="text-xs mb-2">{table.capacity} seats</div>
                  <div className={`text-xs font-bold px-2 py-1 rounded ${
                    table.status === 'occupied' ? 'bg-orange-500 text-white' :
                    table.status === 'on-hold' ? 'bg-yellow-500 text-white' :
                    'bg-emerald-500 text-white'
                  }`}>
                    {table.status}
                  </div>
                  {table.isDefault && (
                    <div className="text-xs mt-2 text-purple-600 font-semibold">Default</div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => editTable(table)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg shadow-md"
                    title="Edit table name"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteTable(table._id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-md"
                    title="Delete table"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Table Name Modal */}
      {editingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md border-2 border-gray-300 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit2 size={24} />
                Edit Table Name
              </h2>
              <button
                onClick={cancelEdit}
                className="text-white hover:text-gray-200 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 bg-white">
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-2">
                  Editing Table #{editingTable.number}
                </p>
                <label className="block text-gray-900 text-base font-bold mb-2">
                  Table Name
                </label>
                <input
                  type="text"
                  value={editTableName}
                  onChange={(e) => setEditTableName(e.target.value)}
                  placeholder="Enter table name (e.g., VIP Table, Garden Area)"
                  className="w-full bg-white text-gray-900 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none text-base"
                  autoFocus
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>Tip:</strong> Give your table a meaningful name like "VIP Table", "Window Seat", or "Garden Area" to help identify it easily.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-100 px-6 py-4 border-t border-gray-300 flex gap-3">
              <button
                onClick={saveTableName}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition text-base"
              >
                Save Name
              </button>
              <button
                onClick={cancelEdit}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}