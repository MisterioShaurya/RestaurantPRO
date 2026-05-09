'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface StaffMember {
  _id: string
  name: string
  email: string
  role: string
  phone: string
  salary: number
  salaryDay: number
  status: 'active' | 'inactive'
}

interface AdvanceRecord {
  _id: string
  staffId: string
  staffName: string
  amount: number
  reason: string
  date: string
}

interface PaymentRecord {
  _id: string
  staffId: string
  staffName: string
  role: string
  salary: number
  month: string
  paid: boolean
  paidDate?: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function PayrollPage() {
  const router = useRouter()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [advances, setAdvances] = useState<AdvanceRecord[]>([])
  const [payingStaffId, setPayingStaffId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [showAdvanceModal, setShowAdvanceModal] = useState(false)
  const [advanceStaffId, setAdvanceStaffId] = useState('')
  const [advanceAmount, setAdvanceAmount] = useState(0)
  const [advanceReason, setAdvanceReason] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [staffRes, payRes, advRes] = await Promise.all([
        fetch('/api/staff'),
        fetch('/api/payroll/payment'),
        fetch('/api/payroll/advance'),
      ])
      
      if (staffRes.ok) {
        const data = await staffRes.json()
        setStaff(data.staff)
      }
      if (payRes.ok) {
        const data = await payRes.json()
        setPayments(data.payments)
      }
      if (advRes.ok) {
        const data = await advRes.json()
        setAdvances(data.advances)
      }
    } catch (err) {
      console.log('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = async (member: StaffMember) => {
    setPayingStaffId(member._id)
    try {
      const res = await fetch('/api/payroll/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: member._id,
          staffName: member.name,
          role: member.role,
          salary: member.salary,
          month: selectedMonth,
        }),
      })
      if (res.ok) {
        const payRes = await fetch('/api/payroll/payment')
        if (payRes.ok) {
          const data = await payRes.json()
          setPayments(data.payments)
        }
        showSuccess(`${member.name}'s salary marked as paid!`)
      }
    } catch (err) {
      console.log('Error marking paid:', err)
    }
    setPayingStaffId(null)
  }

  const handleMarkAllPaid = async () => {
    const activeStaff = staff.filter(s => s.status === 'active' && s.salary > 0)
    const unpaid = activeStaff.filter(m => !isPaid(m._id))
    
    if (unpaid.length === 0) return

    for (const member of unpaid) {
      setPayingStaffId(member._id)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      await fetch('/api/payroll/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: member._id,
          staffName: member.name,
          role: member.role,
          salary: member.salary,
          month: selectedMonth,
        }),
      })
    }

    const payRes = await fetch('/api/payroll/payment')
    if (payRes.ok) {
      const data = await payRes.json()
      setPayments(data.payments)
    }
    setPayingStaffId(null)
    showSuccess(`All ${unpaid.length} payments processed!`)
  }

  const handleAddAdvance = async () => {
    if (!advanceStaffId || advanceAmount <= 0) return
    
    const member = staff.find(s => s._id === advanceStaffId)
    if (!member) return

    try {
      const res = await fetch('/api/payroll/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: advanceStaffId,
          staffName: member.name,
          amount: advanceAmount,
          reason: advanceReason || 'Salary Advance',
          date: new Date().toISOString(),
        }),
      })
      if (res.ok) {
        const advRes = await fetch('/api/payroll/advance')
        if (advRes.ok) {
          const data = await advRes.json()
          setAdvances(data.advances)
        }
        setShowAdvanceModal(false)
        setAdvanceAmount(0)
        setAdvanceReason('')
        showSuccess(`Advance of ₹${advanceAmount} recorded for ${member.name}`)
      }
    } catch (err) {
      console.log('Error adding advance:', err)
    }
  }

  const isPaid = (staffId: string) => {
    return payments.some(p => p.staffId === staffId && p.month === selectedMonth && p.paid)
  }

  const getStaffAdvances = (staffId: string) => {
    return advances.filter(a => a.staffId === staffId)
  }

  const getTotalAdvances = (staffId: string) => {
    return getStaffAdvances(staffId).reduce((sum, a) => sum + a.amount, 0)
  }

  const getPendingSalary = (member: StaffMember) => {
    if (isPaid(member._id)) return 0
    const totalAdvances = getTotalAdvances(member._id)
    return (member.salary || 0) - totalAdvances
  }

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return `${MONTHS[parseInt(month) - 1]} ${year}`
  }

  const activeStaff = staff.filter(s => s.status === 'active')
  const totalPayroll = activeStaff.reduce((sum, m) => sum + m.salary, 0)
  const totalPaid = activeStaff.filter(m => isPaid(m._id)).reduce((sum, m) => sum + m.salary, 0)
  const unpaidCount = activeStaff.filter(m => !isPaid(m._id) && m.salary > 0).length
  const allAdvancesTotal = advances.reduce((sum, a) => sum + a.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-bounce">
          ✅ {successMessage}
        </div>
      )}

      {/* Advance Modal */}
      {showAdvanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Record Salary Advance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Staff Member</label>
                <select
                  value={advanceStaffId}
                  onChange={(e) => setAdvanceStaffId(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">Select staff...</option>
                  {activeStaff.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  min="1"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                <input
                  type="text"
                  placeholder="e.g., Medical emergency"
                  value={advanceReason}
                  onChange={(e) => setAdvanceReason(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdvanceModal(false)}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdvance}
                disabled={!advanceStaffId || advanceAmount <= 0}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition"
              >
                Record Advance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            💰 Payroll Management
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Manage salaries, advances & payments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanceModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition shadow-md"
          >
            💸 Record Advance
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition shadow-md"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Select Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-semibold text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const now = new Date()
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
              const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
              return (
                <option key={val} value={val}>
                  {MONTHS[d.getMonth()]} {d.getFullYear()}
                </option>
              )
            })}
          </select>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Payroll</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{totalPayroll.toLocaleString()}</p>
          <p className="text-xs text-slate-500">{activeStaff.length} active staff</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Paid</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-slate-500">{activeStaff.filter(m => isPaid(m._id)).length} staff paid</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{unpaidCount}</p>
          <p className="text-xs text-slate-500">₹{(totalPayroll - totalPaid).toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Advances</p>
          <p className="text-2xl font-bold text-red-600 mt-1">₹{allAdvancesTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-500">{advances.length} transactions</p>
        </div>
      </div>

      {/* Bulk Actions */}
      {unpaidCount > 0 && (
        <div className="mb-6 flex gap-3">
          <button
            onClick={handleMarkAllPaid}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-md"
          >
            ✅ Mark All as Paid ({unpaidCount})
          </button>
        </div>
      )}

      {/* Payroll Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-600 dark:text-slate-400">Loading payroll...</div>
        </div>
      ) : activeStaff.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-2xl font-semibold text-slate-600 dark:text-slate-400">No active staff members found</p>
          <p className="text-slate-500 mt-2">Add staff members first to manage payroll</p>
          <button
            onClick={() => router.push('/dashboard/staff')}
            className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-md"
          >
            Go to Staff Management
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-700 border-b-2 border-slate-300 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Staff Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Salary</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Advances</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Pending Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Paid Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {activeStaff.map((member) => {
                  const staffAdvances = getStaffAdvances(member._id)
                  const staffAdvanceTotal = getTotalAdvances(member._id)
                  const pending = getPendingSalary(member)
                  const paid = isPaid(member._id)
                  const payment = payments.find(p => p.staffId === member._id && p.month === selectedMonth)

                  return (
                    <tr key={member._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{member.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold capitalize">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                        ₹{member.salary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {staffAdvances.length > 0 ? (
                          <div className="text-red-600 font-semibold">
                            -₹{staffAdvanceTotal.toLocaleString()}
                            <div className="text-xs text-slate-500">{staffAdvances.length} advance(s)</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        {paid ? (
                          <span className="text-emerald-600">₹0</span>
                        ) : (
                          <span className="text-amber-600">₹{pending.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            paid
                              ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {paid ? '✓ Paid' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                        {payment?.paidDate
                          ? new Date(payment.paidDate).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {!paid && member.salary > 0 && (
                          <button
                            onClick={() => handleMarkPaid(member)}
                            disabled={payingStaffId === member._id}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-md ${
                              payingStaffId === member._id
                                ? 'bg-slate-400 text-white cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {payingStaffId === member._id ? 'Processing...' : 'Mark as Paid'}
                          </button>
                        )}
                        {paid && (
                          <span className="text-xs text-emerald-600 font-semibold">✓ Completed</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Advance History */}
      {advances.length > 0 && (
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">📋 Recent Advance Payments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Staff</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {advances.slice(0, 10).map((adv) => (
                  <tr key={adv._id}>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{new Date(adv.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{adv.staffName}</td>
                    <td className="px-4 py-3 font-semibold text-red-600">-₹{adv.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{adv.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Stats */}
      {activeStaff.length > 0 && (
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Month</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{getMonthName(selectedMonth)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Payment Rate</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {activeStaff.length > 0
                  ? `${Math.round((activeStaff.filter(m => isPaid(m._id)).length / activeStaff.length) * 100)}%`
                  : '0%'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Total Processed</p>
              <p className="text-xl font-bold text-indigo-600 mt-1">
                {activeStaff.filter(m => isPaid(m._id)).length} / {activeStaff.length}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Total Advances Given</p>
              <p className="text-xl font-bold text-red-600 mt-1">₹{allAdvancesTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}