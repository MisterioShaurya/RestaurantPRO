'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  Package,
  Loader,
  Shield,
  BarChart3,
  Users,
  CheckCircle,
  DollarSign,
  Utensils,
  ShoppingBag,
  XCircle,
  Edit
} from 'lucide-react'

interface User {
  _id: string
  username: string
  email: string
  name?: string
  restaurantName: string
  isActive: boolean
  isAdmin: boolean
  isFirstLogin: boolean
  tablesCount: number
  createdAt: string
  subscription?: {
    status: string
    plan: string
    end_date: string
    amount: number
  }
}

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalOrders: number
  totalRevenue: number
  activeSubscriptions: number
  totalMenuItems: number
  totalTables: number
  totalReservations: number
  totalInventoryItems: number
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users'>('dashboard')

  useEffect(() => {
    checkAdminAccess()
    fetchDashboardData()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.isAdmin) {
        setError('Admin access required')
        return
      }
    } catch (err) {
      router.push('/login')
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setStats(data.statistics)
      setUsers(data.allUsers)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, updates })
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      setSuccess('User updated successfully')
      setEditingUser(null)
      fetchDashboardData()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update user')
      console.error(err)
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Failed to deactivate user')
      }

      setSuccess('User deactivated successfully')
      fetchDashboardData()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to deactivate user')
      console.error(err)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader className="animate-spin" size={24} />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-500" size={28} />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700 px-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={18} />
              Dashboard
            </span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 border-b-2 transition ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users size={18} />
              Users ({users.length})
            </span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Messages */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/50 rounded-lg mb-6">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-red-200">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">×</button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/50 rounded-lg mb-6">
            <CheckCircle size={20} className="text-green-500" />
            <p className="text-green-200">{success}</p>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <Users className="text-blue-500" size={24} />
                  <span className="text-xs text-slate-400">Total</span>
                </div>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-slate-400 mt-1">{stats.activeUsers} active</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="text-green-500" size={24} />
                  <span className="text-xs text-slate-400">Revenue</span>
                </div>
                <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-slate-400 mt-1">{stats.totalOrders} orders</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="text-purple-500" size={24} />
                  <span className="text-xs text-slate-400">Subscriptions</span>
                </div>
                <p className="text-3xl font-bold">{stats.activeSubscriptions}</p>
                <p className="text-sm text-slate-400 mt-1">Active plans</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <Utensils className="text-orange-500" size={24} />
                  <span className="text-xs text-slate-400">Menu</span>
                </div>
                <p className="text-3xl font-bold">{stats.totalMenuItems}</p>
                <p className="text-sm text-slate-400 mt-1">Items</p>
              </div>
            </div>

            {/* More Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <ShoppingBag className="text-blue-500" size={20} />
                  <span className="text-slate-300">Tables</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalTables}</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-green-500" size={20} />
                  <span className="text-slate-300">Reservations</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalReservations}</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="text-yellow-500" size={20} />
                  <span className="text-slate-300">Inventory</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalInventoryItems}</p>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
              <div className="space-y-3">
                {users.slice(0, 5).map(user => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.isActive ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">Inactive</span>
                      )}
                      {user.isAdmin && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Admin</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search users by email, username, or restaurant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Users List */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Restaurant</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Subscription</th>
                      <th className="text-left p-4 font-medium">Tables</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user._id} className="border-t border-slate-700 hover:bg-slate-700/30">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-slate-400">{user.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{user.restaurantName || 'N/A'}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {user.isActive ? (
                              <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                <CheckCircle size={12} /> Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                                <XCircle size={12} /> Inactive
                              </span>
                            )}
                            {user.isAdmin && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Admin</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {user.subscription ? (
                            <div className="text-sm">
                              <p className="text-slate-300">{user.subscription.plan}</p>
                              <p className="text-slate-400 text-xs">{user.subscription.status}</p>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-sm">No subscription</span>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{user.tablesCount || 0}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2 hover:bg-slate-600 rounded-lg transition"
                              title="Edit user"
                            >
                              <Edit size={16} className="text-blue-400" />
                            </button>
                            {user.isActive && (
                              <button
                                onClick={() => handleDeactivateUser(user._id)}
                                className="p-2 hover:bg-slate-600 rounded-lg transition"
                                title="Deactivate user"
                              >
                                <Trash2 size={16} className="text-red-400" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold">Edit User</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Username</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    value={editingUser.restaurantName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, restaurantName: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tables Count</label>
                  <input
                    type="number"
                    value={editingUser.tablesCount || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, tablesCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingUser.isActive}
                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm">Active</label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={editingUser.isAdmin}
                    onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isAdmin" className="text-sm">Admin</label>
                </div>
              </div>

              <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateUser(editingUser._id, {
                    username: editingUser.username,
                    email: editingUser.email,
                    restaurantName: editingUser.restaurantName,
                    tablesCount: editingUser.tablesCount,
                    isActive: editingUser.isActive,
                    isAdmin: editingUser.isAdmin
                  })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}