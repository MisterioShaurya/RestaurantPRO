'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Edit2, Trash2 } from 'lucide-react'

interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'counter' | 'chef'
  createdAt?: string
}

export default function UserManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'counter' as const })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const getAdminId = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('userId='))
      ?.split('=')[1]
  }

  const fetchUsers = async () => {
    try {
      const adminId = getAdminId()
      const res = await fetch('/api/users', {
        headers: { 'x-admin-id': adminId || '' },
      })
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const adminId = getAdminId()
      
      if (editingId) {
        // Update user
        const res = await fetch(`/api/users/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-id': adminId || '',
          },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error('Failed to update user')
        setSuccess('User updated successfully')
      } else {
        // Create new user
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-id': adminId || '',
          },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error('Failed to create user')
        setSuccess('User created successfully')
      }

      setFormData({ name: '', email: '', password: '', role: 'counter' })
      setEditingId(null)
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const adminId = getAdminId()
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-admin-id': adminId || '' },
      })
      if (!res.ok) throw new Error('Failed to delete user')
      setSuccess('User deleted successfully')
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  const handleEdit = (user: User) => {
    setFormData({ name: user.name, email: user.email, password: '', role: user.role })
    setEditingId(user._id)
    setShowForm(true)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      case 'counter':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'chef':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-md text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              ← Back
            </button>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">👤 User Management</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 ml-12">Create and manage staff accounts</p>
        </div>

        {/* Add User Button */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              setFormData({ name: '', email: '', password: '', role: 'counter' })
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition ${
              showForm
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? 'Cancel' : 'Add User'}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-800 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 rounded-lg">
            {success}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              {editingId ? 'Edit User' : 'Create New User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                    placeholder="user@restaurant.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Password {editingId && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                    placeholder="••••••••"
                    required={!editingId}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="counter">Counter/POS User</option>
                    <option value="chef">Chef (Kitchen Only)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  {editingId ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({ name: '', email: '', password: '', role: 'counter' })
                  }}
                  className="px-6 py-2.5 bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-300 dark:border-blue-600 border-t-blue-600 dark:border-t-blue-300"></div>
              </div>
              <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-lg">No users created yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(user.role)}`}>
                          {user.role === 'counter' ? 'Counter/POS' : user.role === 'chef' ? 'Chef' : 'Admin'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-semibold transition"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-semibold transition"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3">📋 User Roles Guide</h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <span className="font-semibold">Admin:</span> Full access to all features (current)
            </div>
            <div>
              <span className="font-semibold">Counter/POS User:</span> Access to Billing, POS, Tables, Orders, Menu, Inventory, Staff, Reservations, Analytics, Settings
            </div>
            <div>
              <span className="font-semibold">Chef:</span> Access to Kitchen Display and KOT Logs only with notifications
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
