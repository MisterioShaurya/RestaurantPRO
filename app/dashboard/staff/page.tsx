'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
  advancesDeducted: number
  netAmount: number
  month: string
  paid: boolean
  paidDate?: string
}

interface StaffMember {
  _id: string
  name: string
  email: string
  role: string
  phone: string
  salary: number
  salaryDay: number
  joinDate: string
  status: 'active' | 'inactive'
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function StaffPage() {
  const router = useRouter()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [advances, setAdvances] = useState<AdvanceRecord[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [showAdvanceForm, setShowAdvanceForm] = useState(false)
  const [advanceAmount, setAdvanceAmount] = useState(0)
  const [advanceReason, setAdvanceReason] = useState('')
  const [payingStaffId, setPayingStaffId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'waiter',
    salary: 0,
    salaryDay: 1,
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  // Fetch advances + payments when month changes
  useEffect(() => {
    if (staff.length > 0) {
      fetchAdvancesAndPayments()
    }
  }, [selectedMonth, staff.length])

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff')
      if (res.ok) {
        const data = await res.json()
        setStaff(data.staff)
        // Also fetch payroll data
        await fetchAdvancesAndPayments()
      }
    } catch (err) {
      console.log('Error fetching staff:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdvancesAndPayments = async () => {
    try {
      const [advRes, payRes] = await Promise.all([
        fetch('/api/payroll/advance'),
        fetch('/api/payroll/payment?month=' + selectedMonth),
      ])
      if (advRes.ok) {
        const data = await advRes.json()
        setAdvances(data.advances)
      }
      if (payRes.ok) {
        const data = await payRes.json()
        setPayments(data.payments)
      }
    } catch (err) {
      console.log('Error fetching payroll data:', err)
    }
  }

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/staff/${editingId}` : '/api/staff'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email: formData.email || 'no-email@staff.local'
        }),
      })
      if (res.ok) {
        setFormData({ name: '', email: '', phone: '', role: 'waiter', salary: 0, salaryDay: 1 })
        setEditingId(null)
        setShowForm(false)
        await fetchStaff()
      } else {
        const errData = await res.json()
        alert('Error: ' + (errData.message || 'Failed to save staff'))
      }
    } catch (err) {
      console.log('Error adding staff:', err)
    }
  }

  const handleEdit = (member: StaffMember) => {
    setFormData({
      name: member.name,
      email: member.email === 'no-email@staff.local' ? '' : member.email,
      phone: member.phone,
      role: member.role,
      salary: member.salary || 0,
      salaryDay: member.salaryDay || 1,
    })
    setEditingId(member._id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this staff member?')) return
    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setStaff((prev) => prev.filter((s) => s._id !== id))
      }
    } catch (err) {
      console.log('Error deleting staff:', err)
    }
  }

  // Open staff detail modal with full payroll history
  const viewStaffPayroll = async (member: StaffMember) => {
    setSelectedStaff(member)
    setShowAdvanceForm(false)
    setAdvanceAmount(0)
    setAdvanceReason('')
    
    try {
      const [advRes, payRes] = await Promise.all([
        fetch(`/api/payroll/advance?staffId=${member._id}`),
        fetch(`/api/payroll/payment?staffId=${member._id}`),
      ])
      if (advRes.ok) {
        const data = await advRes.json()
        setAdvances(data.advances)
      }
      if (payRes.ok) {
        const data = await payRes.json()
        setPayments(data.payments)
      }
    } catch (err) {
      console.log('Error fetching staff details:', err)
    }
  }

  // Record an advance
  const handleAddAdvance = async () => {
    if (!selectedStaff || advanceAmount <= 0) return
    try {
      const res = await fetch('/api/payroll/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: selectedStaff._id,
          staffName: selectedStaff.name,
          amount: advanceAmount,
          reason: advanceReason || 'Salary Advance',
          date: new Date().toISOString(),
        }),
      })
      if (res.ok) {
        setAdvanceAmount(0)
        setAdvanceReason('')
        setShowAdvanceForm(false)
        viewStaffPayroll(selectedStaff)
        await fetchAdvancesAndPayments()
        showSuccess(`₹${advanceAmount} advance recorded for ${selectedStaff.name}`)
      }
    } catch (err) {
      console.log('Error adding advance:', err)
    }
  }

  const handleDeleteAdvance = async (id: string) => {
    if (!confirm('Delete this advance record?')) return
    try {
      const res = await fetch(`/api/payroll/advance?id=${id}`, { method: 'DELETE' })
      if (res.ok && selectedStaff) {
        viewStaffPayroll(selectedStaff)
        await fetchAdvancesAndPayments()
      }
    } catch (err) {
      console.log('Error deleting advance:', err)
    }
  }

  // Pay salary - deducts advances, saves to DB & expense log
  const handleMarkPaid = async (member: StaffMember) => {
    if (!confirm(`Pay ${member.name} salary for ${getMonthName(selectedMonth)}?`)) return
    setPayingStaffId(member._id)
    try {
      const advRes = await fetch(`/api/payroll/advance?staffId=${member._id}`)
      let totalAdvances = 0
      if (advRes.ok) {
        const advData = await advRes.json()
        totalAdvances = advData.advances.reduce((sum: number, a: AdvanceRecord) => sum + a.amount, 0)
      }
      const netAmount = Math.max(0, (member.salary || 0) - totalAdvances)

      const res = await fetch('/api/payroll/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: member._id,
          staffName: member.name,
          role: member.role,
          salary: member.salary,
          advancesDeducted: totalAdvances,
          netAmount,
          month: selectedMonth,
        }),
      })
      if (res.ok) {
        await fetchAdvancesAndPayments()
        if (selectedStaff) viewStaffPayroll(selectedStaff)
        showSuccess(`${member.name} paid! Salary: ₹${member.salary} | Advances: ₹${totalAdvances} | Net: ₹${netAmount}`)
      }
    } catch (err) {
      console.log('Error marking paid:', err)
    }
    setPayingStaffId(null)
  }

  const handleMarkAllPaid = async () => {
    const activeStaffList = staff.filter(s => s.status === 'active' && s.salary > 0)
    const unpaid = activeStaffList.filter(m => !isPaid(m._id))
    if (unpaid.length === 0) return

    if (!confirm(`Pay all ${unpaid.length} staff for ${getMonthName(selectedMonth)}?`)) return

    for (const member of unpaid) {
      setPayingStaffId(member._id)
      const advRes = await fetch(`/api/payroll/advance?staffId=${member._id}`)
      let totalAdvances = 0
      if (advRes.ok) {
        const advData = await advRes.json()
        totalAdvances = advData.advances.reduce((sum: number, a: AdvanceRecord) => sum + a.amount, 0)
      }
      await fetch('/api/payroll/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: member._id,
          staffName: member.name,
          role: member.role,
          salary: member.salary,
          advancesDeducted: totalAdvances,
          netAmount: Math.max(0, member.salary - totalAdvances),
          month: selectedMonth,
        }),
      })
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    setPayingStaffId(null)
    await fetchAdvancesAndPayments()
    showSuccess(`All ${unpaid.length} payments processed!`)
  }

  const isPaid = (staffId: string) => {
    return payments.some(p => p.staffId === staffId && p.month === selectedMonth && p.paid)
  }

  const getStaffAdvancesForMember = (staffId: string) => {
    return advances.filter(a => a.staffId === staffId)
  }

  const getTotalAdvancesForMember = (staffId: string) => {
    return getStaffAdvancesForMember(staffId).reduce((sum, a) => sum + a.amount, 0)
  }

  const getPendingSalary = (member: StaffMember) => {
    if (isPaid(member._id)) return 0
    const totalAdv = getTotalAdvancesForMember(member._id)
    return Math.max(0, (member.salary || 0) - totalAdv)
  }

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return `${MONTHS[parseInt(month) - 1]} ${year}`
  }

  const totalSalary = staff.reduce((sum, member) => sum + (member.salary || 0), 0)
  const activeStaffCount = staff.filter(s => s.status === 'active').length
  const totalPaidAmount = staff.filter(m => isPaid(m._id) && m.status === 'active').reduce((sum, m) => sum + m.salary, 0)
  const unpaidStaffCount = staff.filter(m => !isPaid(m._id) && m.status === 'active' && m.salary > 0).length
  const allAdvancesTotal = advances.reduce((sum, a) => sum + a.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-bounce">
          ✅ {successMessage}
        </div>
      )}

      {/* Staff Detail Modal - Full Payroll Log */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedStaff.name}</h3>
                <p className="text-sm text-slate-500">
                  {selectedStaff.role} • ₹{selectedStaff.salary.toLocaleString()}/month • Pay Day: {selectedStaff.salaryDay}th
                </p>
              </div>
              <button
                onClick={() => { setSelectedStaff(null); setAdvances([]); setPayments([]) }}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-semibold transition"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-600 uppercase">Monthly Salary</p>
                  <p className="text-xl font-bold text-blue-700">₹{selectedStaff.salary.toLocaleString()}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-semibold text-amber-600 uppercase">Total Advances</p>
                  <p className="text-xl font-bold text-amber-700">₹{getTotalAdvancesForMember(selectedStaff._id).toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs font-semibold text-emerald-600 uppercase">Net Payable</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {isPaid(selectedStaff._id) ? '₹0 ✓' : `₹${getPendingSalary(selectedStaff).toLocaleString()}`}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <p className="text-xs font-semibold text-purple-600 uppercase">Pay Day</p>
                  <p className="text-xl font-bold text-purple-700">{selectedStaff.salaryDay}th</p>
                </div>
              </div>

              {/* Payment Status & Pay Button */}
              <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
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
                
                {isPaid(selectedStaff._id) ? (
                  <span className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg font-bold text-sm">
                    ✅ Paid for {getMonthName(selectedMonth)}
                  </span>
                ) : (
                  <>
                    <span className="px-4 py-2 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-lg font-bold text-sm">
                      ⏳ Due — ₹{getPendingSalary(selectedStaff).toLocaleString()}
                      {getTotalAdvancesForMember(selectedStaff._id) > 0 && (
                        <span className="ml-2 text-xs">(₹{getTotalAdvancesForMember(selectedStaff._id).toLocaleString()} advances deducted)</span>
                      )}
                    </span>
                    <button
                      onClick={() => handleMarkPaid(selectedStaff)}
                      disabled={payingStaffId === selectedStaff._id}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-lg transition shadow-md text-sm"
                    >
                      {payingStaffId === selectedStaff._id ? '⏳...' : '✅ Pay Salary'}
                    </button>
                  </>
                )}
              </div>

              {/* Record Advance */}
              <div>
                <button
                  onClick={() => setShowAdvanceForm(!showAdvanceForm)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-md text-sm"
                >
                  {showAdvanceForm ? '✕ Cancel' : '+ Record Advance'}
                </button>
              </div>

              {showAdvanceForm && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-5 border border-slate-200 dark:border-slate-600">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4">Record Advance (Deducted from Salary)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        min="1"
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                      <input
                        type="text"
                        placeholder="e.g., Medical"
                        value={advanceReason}
                        onChange={(e) => setAdvanceReason(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAddAdvance}
                        disabled={advanceAmount <= 0}
                        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition text-sm"
                      >
                        Save Advance
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Advance Payment Log */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  📋 Advance Log <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600">{advances.length}</span>
                </h4>
                {advances.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-6 text-center">
                    <p className="text-sm text-slate-500">No advances recorded.</p>
                    <p className="text-xs text-slate-400 mt-1">Advances are deducted from salary at payment time.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Date</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Reason</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {advances.map((adv) => (
                          <tr key={adv._id}>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{new Date(adv.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 font-semibold text-red-600">-₹{adv.amount.toLocaleString()}</td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{adv.reason}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDeleteAdvance(adv._id)}
                                className="px-2 py-1 bg-red-100 dark:bg-red-900 hover:bg-red-200 text-red-700 rounded text-xs font-medium"
                              >
                                Del
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Salary Payment Log */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  💰 Payment Log <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600">{payments.length}</span>
                </h4>
                {payments.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-6 text-center">
                    <p className="text-sm text-slate-500">No payments recorded yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Month</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Salary</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Advances Deducted</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Net Paid</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {payments.map((p: PaymentRecord) => (
                          <tr key={p._id}>
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.month}</td>
                            <td className="px-4 py-3 text-slate-700">₹{p.salary.toLocaleString()}</td>
                            <td className="px-4 py-3 text-red-600">{p.advancesDeducted > 0 ? `-₹${p.advancesDeducted.toLocaleString()}` : '—'}</td>
                            <td className="px-4 py-3 font-semibold text-emerald-600">₹{p.netAmount.toLocaleString()}</td>
                            <td className="px-4 py-3 text-slate-700">{p.paidDate ? new Date(p.paidDate).toLocaleDateString() : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            👥 Staff & Payroll
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Manage team, salaries, advances & payments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.back()} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition shadow-md">← Back</button>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', email: '', phone: '', role: 'waiter', salary: 0, salaryDay: 1 }); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition shadow-md"
          >
            {showForm ? 'Cancel' : '+ Add Staff'}
          </button>
        </div>
      </div>

      {/* Add/Edit Staff Form */}
      {showForm && (
        <div className="mb-8 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{editingId ? '✏️ Edit Staff' : '➕ Add New Staff'}</h3>
          <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
              <input type="text" placeholder="John Smith" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email <span className="text-xs text-slate-400">(optional)</span></label>
              <input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone *</label>
              <input type="tel" placeholder="555-1234" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white">
                <option value="waiter">Waiter</option>
                <option value="chef">Chef</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Salary (₹/month)</label>
              <input type="number" placeholder="0" min="0" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monthly Payment Date</label>
              <select value={formData.salaryDay} onChange={(e) => setFormData({ ...formData, salaryDay: Number(e.target.value) })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white">
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}th</option>
                ))}
              </select>
            </div>
            <button type="submit" className="md:col-span-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition">
              {editingId ? '✏️ Update Staff' : '➕ Add Staff Member'}
            </button>
          </form>
        </div>
      )}

      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Payroll Month</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-semibold text-sm">
            {Array.from({ length: 12 }, (_, i) => {
              const now = new Date(); const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              return <option key={val} value={val}>{MONTHS[d.getMonth()]} {d.getFullYear()}</option>;
            })}
          </select>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase">Staff</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{staff.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase">Active</p>
          <p className="text-2xl font-bold text-emerald-600">{activeStaffCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase">Payroll</p>
          <p className="text-2xl font-bold text-indigo-600">₹{totalSalary.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase">Paid</p>
          <p className="text-2xl font-bold text-emerald-600">₹{totalPaidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase">Advances</p>
          <p className="text-2xl font-bold text-amber-600">₹{allAdvancesTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Bulk Pay */}
      {unpaidStaffCount > 0 && (
        <div className="mb-6">
          <button onClick={handleMarkAllPaid} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-md">
            ✅ Pay All ({unpaidStaffCount}) Staff for {getMonthName(selectedMonth)}
          </button>
        </div>
      )}

      {/* Staff Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="text-slate-600 dark:text-slate-400">Loading...</div></div>
      ) : staff.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-2xl font-semibold text-slate-600 dark:text-slate-400">No staff yet</p>
          <p className="text-slate-500 mt-2">Add your team to manage payroll</p>
          <button onClick={() => { setShowForm(true); setFormData({ name: '', email: '', phone: '', role: 'waiter', salary: 0, salaryDay: 1 }); }} className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-md">+ Add Staff</button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Salary</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Pay Day</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Advances</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">This Month</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {staff.map((member) => {
                  const advTotal = getTotalAdvancesForMember(member._id)
                  const paid = isPaid(member._id)
                  const pending = getPendingSalary(member)
                  return (
                    <tr key={member._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                        <div>{member.name}</div>
                        <div className="text-xs text-slate-500">{member.email === 'no-email@staff.local' ? '' : member.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold capitalize">{member.role}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">₹{(member.salary || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{member.salaryDay || 1}th</td>
                      <td className="px-6 py-4 text-sm">
                        {advTotal > 0 ? <span className="text-red-600 font-semibold">-₹{advTotal.toLocaleString()}</span> : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">
                        {paid ? <span className="text-emerald-600">₹0</span> : <span className="text-amber-600">₹{pending.toLocaleString()}</span>}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {member.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-1">
                        <button onClick={() => viewStaffPayroll(member)} className="px-3 py-2 bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 text-emerald-700 rounded text-xs font-medium transition">Payroll</button>
                        <button onClick={() => handleEdit(member)} className="px-3 py-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition">Edit</button>
                        <button onClick={() => handleDelete(member._id)} className="px-3 py-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition">Del</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}