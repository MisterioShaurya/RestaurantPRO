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
  status: 'active' | 'inactive'
}

interface PayrollRecord {
  staffId: string
  name: string
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
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [payingStaffId, setPayingStaffId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff')
      if (res.ok) {
        const data = await res.json()
        setStaff(data.staff)
        generatePayrollRecords(data.staff)
      }
    } catch (err) {
      console.log('Error fetching staff:', err)
    } finally {
      setLoading(false)
    }
  }

  const generatePayrollRecords = (staffList: StaffMember[]) => {
    const records: PayrollRecord[] = staffList
      .filter(m => m.status === 'active')
      .map(m => ({
        staffId: m._id,
        name: m.name,
        role: m.role,
        salary: m.salary || 0,
        month: selectedMonth,
        paid: false,
      }))
    setPayrollRecords(records)
  }

  useEffect(() => {
    if (staff.length > 0) {
      generatePayrollRecords(staff)
    }
  }, [selectedMonth])

  const handleMarkPaid = async (staffId: string) => {
    setPayingStaffId(staffId)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 500))
    setPayrollRecords(prev =>
      prev.map(r =>
        r.staffId === staffId
          ? { ...r, paid: true, paidDate: new Date().toISOString() }
          : r
      )
    )
    setPayingStaffId(null)
    showSuccess('Payment marked as paid!')
  }

  const handleMarkAllPaid = async () => {
    const unpaid = payrollRecords.filter(r => !r.paid && r.salary > 0)
    if (unpaid.length === 0) return

    // Process one by one
    for (const record of unpaid) {
      setPayingStaffId(record.staffId)
      await new Promise(resolve => setTimeout(resolve, 200))
      setPayrollRecords(prev =>
        prev.map(r =>
          r.staffId === record.staffId
            ? { ...r, paid: true, paidDate: new Date().toISOString() }
            : r
        )
      )
    }
    setPayingStaffId(null)
    showSuccess(`All ${unpaid.length} payments processed!`)
  }

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return `${MONTHS[parseInt(month) - 1]} ${year}`
  }

  const totalPayroll = payrollRecords.reduce((sum, r) => sum + r.salary, 0)
  const totalPaid = payrollRecords.filter(r => r.paid).reduce((sum, r) => sum + r.salary, 0)
  const unpaidCount = payrollRecords.filter(r => !r.paid && r.salary > 0).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-bounce">
          ✅ {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            💰 Payroll Management
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Manage staff salaries and payments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition shadow-md"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Month Selector & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Select Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-semibold text-lg"
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

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Payroll</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">₹{totalPayroll.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{payrollRecords.length} active staff</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Paid</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">₹{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{payrollRecords.filter(r => r.paid).length} staff paid</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Pending Payments</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{unpaidCount}</p>
          <p className="text-xs text-slate-500 mt-1">₹{(totalPayroll - totalPaid).toLocaleString()} remaining</p>
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
      ) : payrollRecords.length === 0 ? (
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
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Monthly Salary</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Paid Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {payrollRecords.map((record) => (
                  <tr key={record.staffId} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{record.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold capitalize">
                        {record.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                      ₹{record.salary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          record.paid
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {record.paid ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {record.paidDate
                        ? new Date(record.paidDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {!record.paid && record.salary > 0 && (
                        <button
                          onClick={() => handleMarkPaid(record.staffId)}
                          disabled={payingStaffId === record.staffId}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-md ${
                            payingStaffId === record.staffId
                              ? 'bg-slate-400 text-white cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {payingStaffId === record.staffId ? 'Processing...' : 'Mark as Paid'}
                        </button>
                      )}
                      {record.paid && (
                        <span className="text-xs text-emerald-600 font-semibold">✓ Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Stats */}
      {payrollRecords.length > 0 && (
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Month</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{getMonthName(selectedMonth)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Payment Rate</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {payrollRecords.length > 0
                  ? `${Math.round((payrollRecords.filter(r => r.paid).length / payrollRecords.length) * 100)}%`
                  : '0%'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Total Processed</p>
              <p className="text-xl font-bold text-indigo-600 mt-1">
                {payrollRecords.filter(r => r.paid).length} / {payrollRecords.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}