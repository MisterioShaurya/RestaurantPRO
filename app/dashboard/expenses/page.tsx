'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Expense {
  _id: string
  type: string
  description: string
  amount: number
  category: string
  date: string
  staffId?: string
  month?: string
}

interface ExpenseConfig {
  investment: number
  capital: number
}

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<ExpenseConfig>({ investment: 0, capital: 0 })
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [editConfig, setEditConfig] = useState({ investment: 0, capital: 0 })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: 'General',
    date: new Date().toISOString().split('T')[0],
  })
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  const categories = ['All', 'General', 'Salary', 'Inventory Purchase', 'Utilities', 'Rent', 'Maintenance', 'Marketing', 'Food Cost', 'Equipment', 'Other']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [expRes, configRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/expenses/config'),
      ])
      if (expRes.ok) {
        const data = await expRes.json()
        setExpenses(data.expenses)
      }
      if (configRes.ok) {
        const data = await configRes.json()
        if (data.config) {
          setConfig(data.config)
          setEditConfig(data.config)
        }
      }
    } catch (err) {
      console.log('Error fetching expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/expenses/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editConfig),
      })
      if (res.ok) {
        setConfig(editConfig)
        setShowConfigModal(false)
        alert('Investment/Capital details updated!')
      }
    } catch (err) {
      console.log('Error saving config:', err)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          type: 'general',
          date: new Date(newExpense.date).toISOString(),
        }),
      })
      if (res.ok) {
        fetchData()
        setNewExpense({ description: '', amount: 0, category: 'General', date: new Date().toISOString().split('T')[0] })
        setShowAddForm(false)
      }
    } catch (err) {
      console.log('Error adding expense:', err)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete this expense record?')) return
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setExpenses(prev => prev.filter(e => e._id !== id))
      }
    } catch (err) {
      console.log('Error deleting expense:', err)
    }
  }

  // Filtering
  const filteredExpenses = expenses.filter(e => {
    if (filterCategory !== 'All' && e.category !== filterCategory) return false
    if (filterStartDate && new Date(e.date) < new Date(filterStartDate)) return false
    if (filterEndDate && new Date(e.date) > new Date(filterEndDate)) return false
    return true
  })

  // Calculations
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const salaryExpenses = expenses.filter(e => e.category === 'Salary').reduce((sum, e) => sum + e.amount, 0)
  const inventoryExpenses = expenses.filter(e => e.category === 'Inventory Purchase').reduce((sum, e) => sum + e.amount, 0)
  const profitLoss = config.investment - totalExpenses
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const thisMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).reduce((sum, e) => sum + e.amount, 0)

  // Group expenses by category
  const categoryTotals: Record<string, number> = {}
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Update Investment & Capital</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Investment (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={editConfig.investment}
                  onChange={(e) => setEditConfig({ ...editConfig, investment: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Capital (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={editConfig.capital}
                  onChange={(e) => setEditConfig({ ...editConfig, capital: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            💸 Expense Management
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Track all expenses, purchases & financials</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-md"
          >
            ⚙️ Investment/Capital
          </button>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setNewExpense({ description: '', amount: 0, category: 'General', date: new Date().toISOString().split('T')[0] }) }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition shadow-md"
          >
            {showAddForm ? 'Cancel' : '+ New Expense'}
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition shadow-md"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="mb-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">New Expense / Purchase</h3>
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g., Purchased chicken"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
              <input
                type="number"
                placeholder="0"
                min="1"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
              >
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="md:col-span-2 lg:col-span-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-md"
            >
              + Add Expense
            </button>
          </form>
        </div>
      )}

      {/* Top Summary Cards - Permanent Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 shadow-lg text-white">
          <p className="text-xs font-semibold uppercase opacity-80">Total Investment</p>
          <p className="text-3xl font-bold mt-1">₹{(config.investment || 0).toLocaleString()}</p>
          <button
            onClick={() => setShowConfigModal(true)}
            className="mt-2 text-xs underline opacity-80 hover:opacity-100"
          >
            Edit
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 shadow-lg text-white">
          <p className="text-xs font-semibold uppercase opacity-80">Current Capital</p>
          <p className="text-3xl font-bold mt-1">₹{(config.capital || 0).toLocaleString()}</p>
          <button
            onClick={() => setShowConfigModal(true)}
            className="mt-2 text-xs underline opacity-80 hover:opacity-100"
          >
            Edit
          </button>
        </div>

        <div className={`rounded-xl p-5 shadow-lg text-white ${profitLoss >= 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
          <p className="text-xs font-semibold uppercase opacity-80">Profit / Loss</p>
          <p className="text-3xl font-bold mt-1">
            {profitLoss >= 0 ? '+' : ''}₹{profitLoss.toLocaleString()}
          </p>
          <p className="text-xs opacity-80 mt-1">{profitLoss >= 0 ? '✅ Profitable' : '⚠️ Loss'}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 shadow-lg text-white">
          <p className="text-xs font-semibold uppercase opacity-80">This Month Expenses</p>
          <p className="text-3xl font-bold mt-1">₹{thisMonthExpenses.toLocaleString()}</p>
          <p className="text-xs opacity-80 mt-1">{new Date().toLocaleString('default', { month: 'long' })} {thisYear}</p>
        </div>
      </div>

      {/* Secondary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Expenses (All Time)</p>
          <p className="text-2xl font-bold text-red-600 mt-1">₹{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase">Salary Expenses</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">₹{salaryExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase">Inventory Purchase Expenses</p>
          <p className="text-2xl font-bold text-pink-600 mt-1">₹{inventoryExpenses.toLocaleString()}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {Object.entries(categoryTotals).sort(([, a], [, b]) => b - a).map(([cat, total]) => (
          <div key={cat} className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 uppercase truncate">{cat}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">₹{total.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">From</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">To</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="pt-5">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Showing: <span className="font-bold">₹{filteredTotal.toLocaleString()}</span> from {filteredExpenses.length} records
            </p>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-600 dark:text-slate-400">Loading expenses...</div>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-2xl font-semibold text-slate-600 dark:text-slate-400">No expenses found</p>
          <p className="text-slate-500 mt-2">Add your first expense to start tracking</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-md"
          >
            + Add Expense
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-700 border-b-2 border-slate-300 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {expense.description}
                      {expense.staffId && <span className="text-xs text-slate-500 ml-2">(Salary)</span>}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        expense.category === 'Salary' ? 'bg-indigo-100 text-indigo-700' :
                        expense.category === 'Inventory Purchase' ? 'bg-pink-100 text-pink-700' :
                        expense.category === 'Utilities' ? 'bg-blue-100 text-blue-700' :
                        expense.category === 'Rent' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600">
                      -₹{expense.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDeleteExpense(expense._id)}
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