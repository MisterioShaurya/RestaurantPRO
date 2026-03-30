'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface FoodItem {
  _id: string
  name: string
  price: number
  category: string
  available: boolean
  description?: string
}

export default function MenuPage() {
  const router = useRouter()
  const [items, setItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: 'Main Course',
    available: true,
    description: '',
  })
  const [showPreAddFor, setShowPreAddFor] = useState<any | null>(null)
  const [tables, setTables] = useState<any[]>([])
  const [preQty, setPreQty] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = ['All', 'Main Course', 'Appetizer', 'Beverage', 'Dessert', 'Soup']

  useEffect(() => {
    fetchMenuItems()
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables')
      if (res.ok) {
        const data = await res.json()
        setTables(data.tables || [])
      }
    } catch (err) {
      console.log('Error fetching tables:', err)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/menu')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (err) {
      console.log('Error fetching menu:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/menu/${editingId}` : '/api/menu'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchMenuItems()
        setFormData({ name: '', price: 0, category: 'Main Course', available: true, description: '' })
        setEditingId(null)
        setShowForm(false)
      }
    } catch (err) {
      console.log('Error saving item:', err)
    }
  }

  const handleEdit = (item: FoodItem) => {
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      available: item.available,
      description: item.description || '',
    })
    setEditingId(item._id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i._id !== id))
      }
    } catch (err) {
      console.log('Error deleting item:', err)
    }
  }

  const filteredItems = selectedCategory === 'All' ? items : items.filter((i) => i.category === selectedCategory)

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              🍽️ Menu Management
            </h1>
            <p className="text-slate-600 dark:text-slate-300">Add and manage food items with prices</p>
          </div>
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
              setFormData({ name: '', price: 0, category: 'Main Course', available: true, description: '' })
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition shadow-md"
          >
            {showForm ? 'Cancel' : '+ Add Item'}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-8 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{editingId ? 'Edit Item' : 'Create New Menu Item'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item name</label>
                <input
                  type="text"
                  placeholder="e.g., Grilled Chicken"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                >
                  <option>Main Course</option>
                  <option>Appetizer</option>
                  <option>Beverage</option>
                  <option>Dessert</option>
                  <option>Soup</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Availability</label>
                <label className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-900 dark:text-white font-medium">Available</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (optional)</label>
              <textarea
                placeholder="e.g., Tender grilled chicken with herbs..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition"
            >
              {editingId ? 'Update Item' : 'Add Item'}
            </button>
          </form>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:shadow-md'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-600 dark:text-slate-400">Loading menu items...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-md hover:shadow-lg transition flex flex-col">
              <div className="mb-4 flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{item.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{item.category}</p>
                {item.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{item.description}</p>
                )}
              </div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${item.price.toFixed(2)}</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.available
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  {item.available ? 'Available' : 'Out'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 text-indigo-700 dark:text-indigo-400 rounded-lg font-medium text-sm transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowPreAddFor(item)}
                  className="flex-1 px-3 py-2 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-800/50 text-orange-700 dark:text-orange-400 rounded-lg font-medium text-sm transition"
                >
                  Pre-add
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-400 rounded-lg font-medium text-sm transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pre-add Modal */}
      {showPreAddFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Pre-add "{showPreAddFor.name}"</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Table</label>
                <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" onChange={(e) => {}} defaultValue="">
                  <option value="">Choose a table...</option>
                  {tables.map((t) => (
                    <option key={t._id} value={t.number}>{`Table ${t.number} (${t.capacity} seats)`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quantity</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreQty(Math.max(1, preQty - 1))}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg"
                  >
                    −
                  </button>
                  <input type="number" min={1} value={preQty} onChange={(e) => setPreQty(Math.max(1, Number(e.target.value)))} className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-center font-semibold" />
                  <button
                    onClick={() => setPreQty(preQty + 1)}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={async () => {
                    const select = document.querySelector('select') as HTMLSelectElement | null
                    const tableNumber = select ? Number(select.value) : null
                    if (!tableNumber) {
                      alert('Select a table')
                      return
                    }
                    try {
                      const res = await fetch('/api/preorders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          tableNumber,
                          items: [{ foodItemId: showPreAddFor._id, name: showPreAddFor.name, price: showPreAddFor.price, qty: preQty }],
                        }),
                      })
                      if (res.ok) {
                        alert('Pre-added to table')
                        setShowPreAddFor(null)
                        setPreQty(1)
                      } else {
                        alert('Failed to pre-add')
                      }
                    } catch (err) {
                      console.log('Pre-add error', err)
                      alert('Failed to pre-add')
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                >
                  Add to Table
                </button>
                <button onClick={() => setShowPreAddFor(null)} className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
