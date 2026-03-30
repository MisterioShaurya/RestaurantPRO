'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Upload, Download, X, Check, AlertCircle } from 'lucide-react'

interface MenuItem {
  _id?: string
  id?: string
  name: string
  price: number
  category: string
  available: boolean
  description?: string
}

export default function MenuPage() {
  const router = useRouter()
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: 'Main Course',
    available: true,
    description: '',
  })

  const categories = ['All', 'Main Course', 'Appetizer', 'Beverage', 'Dessert', 'Soup', 'Breads', 'Sides']

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/menu', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || data || [])
      }
    } catch (err) {
      console.log('Error fetching menu:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || formData.price <= 0) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingId ? `/api/menu/${editingId}` : '/api/menu'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchMenuItems()
        resetForm()
        showSuccess(editingId ? 'Menu item updated!' : 'Menu item added!')
      }
    } catch (err) {
      console.log('Error saving item:', err)
      alert('Error saving menu item')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', price: 0, category: 'Main Course', available: true, description: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      available: item.available,
      description: item.description || '',
    })
    setEditingId(item._id || item.id || '')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/menu/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (res.ok) {
        fetchMenuItems()
        showSuccess('Menu item deleted!')
      }
    } catch (err) {
      console.log('Error deleting item:', err)
    }
  }

  const handleJSONImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      let itemsToImport: MenuItem[] = []
      if (Array.isArray(data)) {
        itemsToImport = data
      } else if (data.items && Array.isArray(data.items)) {
        itemsToImport = data.items
      } else if (data.menu && Array.isArray(data.menu)) {
        itemsToImport = data.menu
      }

      if (itemsToImport.length === 0) {
        alert('No menu items found in the JSON file')
        return
      }

      // Import items one by one
      for (const item of itemsToImport) {
        if (item.name && item.price) {
          await fetch('/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: item.name,
              price: item.price,
              category: item.category || 'Main Course',
              available: item.available !== false,
              description: item.description || '',
            }),
          })
        }
      }

      fetchMenuItems()
      showSuccess(`Imported ${itemsToImport.length} menu items!`)
    } catch (err) {
      console.log('Error importing JSON:', err)
      alert('Error importing JSON file. Please check the format.')
    }
  }

  const handleJSONExport = () => {
    const dataToExport = {
      restaurantMenu: items.map(item => ({
        name: item.name,
        price: item.price,
        category: item.category,
        available: item.available,
        description: item.description,
      })),
      exportedAt: new Date().toISOString(),
    }

    const jsonString = JSON.stringify(dataToExport, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `menu-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showSuccess('Menu exported!')
  }

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 p-8">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-bounce">
          <Check className="w-6 h-6" />
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition shadow-md"
          >
            ← Back
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              <Plus className="w-6 h-6" />
              Add Menu Item
            </button>

            <label className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl cursor-pointer">
              <Upload className="w-6 h-6" />
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleJSONImport}
                className="hidden"
              />
            </label>

            <button
              onClick={handleJSONExport}
              className="flex items-center gap-3 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              <Download className="w-6 h-6" />
              Export JSON
            </button>
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">📜 Menu Management</h1>
        <p className="text-xl text-gray-600">Create and manage your restaurant menu items</p>
      </div>

      {/* Removed Top Action Bar - buttons moved to header */}
      <div className="hidden">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl"
        >
          <Plus className="w-6 h-6" />
          Add Menu Item
        </button>

        <label className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl cursor-pointer">
          <Upload className="w-6 h-6" />
          Import JSON
          <input
            type="file"
            accept=".json"
            onChange={handleJSONImport}
            className="hidden"
          />
        </label>

        <button
          onClick={handleJSONExport}
          className="flex items-center gap-3 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl"
        >
          <Download className="w-6 h-6" />
          Export JSON
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {editingId ? '✏️ Edit Menu Item' : '➕ Add Menu Item'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-lg"
                    placeholder="e.g., Butter Chicken"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-lg"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-lg"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="w-6 h-6"
                    />
                    <span className="text-lg font-semibold text-gray-700">Available</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors text-lg"
                  placeholder="Optional description"
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {editingId ? '✓ Update Item' : '✓ Add Item'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-10 flex gap-3 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-xl'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items Grid - Square Cards */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-2xl text-gray-600 font-semibold">No menu items found</p>
          <p className="text-gray-500 mt-2">Add your first menu item by clicking "Add Menu Item" above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div
              key={item._id || item.id}
              className="aspect-square bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-emerald-400 flex flex-col p-6 group"
            >
              {/* Status Badge */}
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    item.available
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {item.available ? '✓ Available' : '✗ Unavailable'}
                </span>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                  {item.category}
                </span>
              </div>

              {/* Item Details */}
              <div className="flex-1 flex flex-col justify-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                )}
              </div>

              {/* Price and Actions */}
              <div className="flex justify-between items-end mt-auto">
                <p className="text-3xl font-bold text-emerald-600">₹{item.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id || item.id || '')}
                    className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-gray-600 text-sm font-semibold">Total Items</p>
            <p className="text-4xl font-bold text-emerald-600 mt-2">{items.length}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-semibold">Available</p>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {items.filter(i => i.available).length}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-semibold">Unavailable</p>
            <p className="text-4xl font-bold text-red-600 mt-2">
              {items.filter(i => !i.available).length}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-semibold">Categories</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {new Set(items.map(i => i.category)).size}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
