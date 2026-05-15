'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  Eye, 
  EyeOff,
  Loader,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Lock,
  ChevronLeft
} from 'lucide-react'

interface RoleAccount {
  _id: string
  name: string
  email: string
  role: 'chef' | 'cashier'
  isActive: boolean
  createdAt: string
}

export default function RoleManagementPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<RoleAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Get restaurant name from logged-in user
  const [restaurantName, setRestaurantName] = useState('')

  // Create Account Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'chef' as 'chef' | 'cashier'
  })
  const [createLoading, setCreateLoading] = useState(false)

  // Edit Account Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editAccount, setEditAccount] = useState<RoleAccount | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    isActive: true
  })
  const [editLoading, setEditLoading] = useState(false)

  // Reset Password Modal
  const [showResetPwModal, setShowResetPwModal] = useState(false)
  const [resetPwAccount, setResetPwAccount] = useState<RoleAccount | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetPwLoading, setResetPwLoading] = useState(false)

  useEffect(() => {
    checkAccess()
    fetchAccounts()
    // Load restaurant name from user data
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        const emailDomain = user.restaurantName 
          ? user.restaurantName.toLowerCase().replace(/\s+/g, '') + '.com'
          : 'restaurant.com'
        setRestaurantName(emailDomain)
      } catch {}
    }
  }, [])

  const checkAccess = async () => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    try {
      const user = JSON.parse(userStr)
      // Check both isAdmin flag and role field for flexibility
      const isAdmin = user.isAdmin === true || user.role === 'admin'
      if (!isAdmin) {
        // Double-check with server in case localStorage has stale data
        const token = localStorage.getItem('token')
        if (token) {
          try {
            const res = await fetch('/api/auth/verify', {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
              const data = await res.json()
              if (data.user?.isAdmin) {
                // Update localStorage with correct admin status
                localStorage.setItem('user', JSON.stringify(data.user))
                return // Access granted
              }
            }
          } catch {}
        }
        router.push('/dashboard')
      } else {
        // Ensure user object also has role field for cross-compatibility
        if (!user.role && user.isAdmin) {
          const updatedUser = { ...user, role: 'admin' }
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      }
    } catch {
      router.push('/login')
    }
  }

  // Auto-generate email when role changes or restaurant name is known
  useEffect(() => {
    if (restaurantName) {
      setCreateForm(prev => ({
        ...prev,
        email: `${prev.role}@${restaurantName}`
      }))
    }
  }, [createForm.role, restaurantName])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setAccounts(data.accounts || [])
      } else {
        setError('Failed to fetch role accounts')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setError('')
    setSuccess('')

    try {
      // Ensure email is up-to-date before sending
      const updatedForm = {
        ...createForm,
        email: `${createForm.role}@${restaurantName}`
      }

      const token = localStorage.getItem('token')
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedForm)
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(data.message)
        setShowCreateModal(false)
        setCreateForm({ name: '', email: '', password: '', role: 'chef' })
        fetchAccounts()
      } else {
        setError(data.message || 'Failed to create account')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editAccount) return
    setEditLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          accountId: editAccount._id,
          updates: editForm
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(data.message)
        setShowEditModal(false)
        setEditAccount(null)
        fetchAccounts()
      } else {
        setError(data.message || 'Failed to update account')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setEditLoading(false)
    }
  }

  const handleToggleActive = async (account: RoleAccount) => {
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          accountId: account._id,
          updates: { isActive: !account.isActive }
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(data.message)
        fetchAccounts()
      } else {
        setError(data.message || 'Failed to update account')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const handleResetPassword = async () => {
    if (!resetPwAccount || !newPassword) return
    setResetPwLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          accountId: resetPwAccount._id,
          updates: { password: newPassword }
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Password reset successfully')
        setShowResetPwModal(false)
        setResetPwAccount(null)
        setNewPassword('')
      } else {
        setError(data.message || 'Failed to reset password')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setResetPwLoading(false)
    }
  }

  const filteredAccounts = accounts.filter(acc =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader className="animate-spin text-purple-600" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition mb-4 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield size={32} className="text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Role Management</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  Manage chef and cashier accounts for your restaurant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAccounts}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2 shadow-lg"
              >
                <Plus size={16} />
                Create Account
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
            <AlertCircle size={20} className="text-red-500 shrink-0" />
            <p className="text-red-700 dark:text-red-400 flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">&times;</button>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-6">
            <CheckCircle size={20} className="text-green-500 shrink-0" />
            <p className="text-green-700 dark:text-green-400 flex-1">{success}</p>
            <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600">&times;</button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Total Accounts</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{accounts.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Chef</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {accounts.filter(a => a.role === 'chef').length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Cashier</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {accounts.filter(a => a.role === 'cashier').length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Active</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {accounts.filter(a => a.isActive).length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Created</th>
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      <Shield size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="font-semibold">No accounts found</p>
                      <p className="text-sm mt-1">Create your first chef or cashier account to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account, index) => (
                    <tr key={account._id} className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition ${
                      index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-800/50'
                    }`}>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{account.name}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{account.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          account.role === 'chef'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {account.role === 'chef' ? '\u{1F468}\u{200D}\u{1F373} Chef' : '\u{1F4B3} Cashier'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(account)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                            account.isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-red-100 hover:text-red-800'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-emerald-100 hover:text-emerald-800'
                          }`}
                          title={account.isActive ? 'Click to disable' : 'Click to enable'}
                        >
                          {account.isActive ? (
                            <><CheckCircle2 size={12} /> Active</>
                          ) : (
                            <><XCircle size={12} /> Disabled</>
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(account.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditAccount(account)
                              setEditForm({
                                name: account.name,
                                email: account.email,
                                isActive: account.isActive
                              })
                              setShowEditModal(true)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                            title="Edit account"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setResetPwAccount(account)
                              setNewPassword('')
                              setShowResetPwModal(true)
                            }}
                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition"
                            title="Reset password"
                          >
                          <Lock size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Role Account</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Create a chef or cashier account for your restaurant
              </p>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                  placeholder="e.g. Chef Kumar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => {
                    const role = e.target.value as 'chef' | 'cashier'
                    setCreateForm({ ...createForm, role })
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                >
                  <option value="chef">{'\u{1F468}\u{200D}\u{1F373}'} Chef</option>
                  <option value="cashier">{'\u{1F4B3}'} Cashier</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email <span className="text-xs font-normal text-slate-500">(auto-generated)</span>
                </label>
                <div className="w-full px-4 py-2.5 bg-purple-50 dark:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-700 rounded-xl text-slate-900 dark:text-white font-mono font-semibold">
                  {createForm.role}@{restaurantName || 'yourrestaurant.com'}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Auto-generated based on role and your restaurant name
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                    placeholder="Min 6 characters"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {createLoading ? <Loader size={16} className="animate-spin" /> : null}
                  {createLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && editAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Account</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Update account details for {editAccount.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Account Active
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={editLoading}
                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {editLoading ? <Loader size={16} className="animate-spin" /> : null}
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPwModal && resetPwAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Set a new password for {resetPwAccount.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-purple-500 text-slate-900 dark:text-white"
                    placeholder="Min 6 characters"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => setShowResetPwModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetPwLoading || !newPassword}
                className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {resetPwLoading ? <Loader size={16} className="animate-spin" /> : null}
                {resetPwLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}