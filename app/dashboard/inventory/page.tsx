'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface InventoryItem {
  _id: string
  name: string
  quantity: number
  unit: string
  minStock: number
  cost: number
  category: string
}

export default function InventoryPage() {
  const router = useRouter()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: 'kg',
    minStock: 0,
    cost: 0,
    category: '',
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items)
      }
    } catch (err) {
      console.log('Error fetching inventory:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/inventory/${editingId}` : '/api/inventory'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        fetchInventory()
        setFormData({ name: '', quantity: 0, unit: 'kg', minStock: 0, cost: 0, category: '' })
        setEditingId(null)
        setShowForm(false)
      }
    } catch (err) {
      console.log('Error adding item:', err)
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      minStock: item.minStock,
      cost: item.cost,
      category: item.category,
    })
    setEditingId(item._id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i._id !== id))
      }
    } catch (err) {
      console.log('Error deleting item:', err)
    }
  }

  const lowStockItems = items.filter((item) => item.quantity <= item.minStock)

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            📦 Inventory Management
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Track stock and supplies</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition shadow-md"
          >
            ← Back
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              setFormData({ name: '', quantity: 0, unit: 'kg', minStock: 0, cost: 0, category: '' })
            }}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition shadow-md"
          >
            {showForm ? 'Cancel' : '+ Add Item'}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-8 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item name</label>
              <input
                type="text"
                placeholder="e.g., Chicken Breast"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
              <input
                type="number"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
              >
                <option>kg</option>
                <option>L</option>
                <option>piece</option>
                <option>box</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Stock Level</label>
              <input
                type="number"
                placeholder="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cost</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g., Meat"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              className="md:col-span-2 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition"
            >
              {editingId ? 'Update Item' : 'Add Item'}
            </button>
          </form>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
          <p className="font-bold text-red-700 dark:text-red-300">⚠️ {lowStockItems.length} items below minimum stock level</p>
        </div>
      )}

      {/* Inventory Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-600 dark:text-slate-400">Loading inventory...</div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Item</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Min Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{item.category}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{item.minStock}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.quantity <= item.minStock
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {item.quantity <= item.minStock ? 'Low Stock' : 'OK'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="px-3 py-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded text-xs font-medium transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
