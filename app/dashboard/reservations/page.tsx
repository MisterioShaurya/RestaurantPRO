'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Reservation {
  _id: string
  customerName: string
  customerPhone: string
  tableNumber: number
  guestCount: number
  reservationTime: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  expiresAt?: string
  timeRemaining?: number
}

export default function ReservationsPage() {
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    guestCount: 2,
    tableNumber: undefined as number | undefined,
    reservationTime: '',
  })

  useEffect(() => {
    fetchReservations()
    // Refresh reservations every 30 seconds
    const interval = setInterval(fetchReservations, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations')
      if (res.ok) {
        const data = await res.json()
        const sortedReservations = [...(data.reservations || [])].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setReservations(sortedReservations)
      }
    } catch (err) {
      console.log('Error fetching reservations:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredReservations = filterStatus === 'all' ? reservations : reservations.filter((r) => r.status === filterStatus)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
      case 'confirmed':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
      case 'no-show':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
      default:
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">📋 Reservation Logs</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">View reservation history and details</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition shadow-md"
        >
          ← Back
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['all', 'confirmed', 'completed', 'cancelled', 'no-show'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-6 py-3 font-bold rounded-lg whitespace-nowrap capitalize transition shadow-md ${
              filterStatus === status
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:border-indigo-500'
            }`}
          >
            {status === 'all' ? '📊 All' : status === 'no-show' ? '❌ No-Show' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Reservations Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-600 dark:text-slate-400 text-lg">Loading reservations...</div>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-600 dark:text-slate-400 text-lg">No reservations found</div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Guests</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Table</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Reservation Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{reservation.customerName}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{reservation.customerPhone}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{reservation.guestCount}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {reservation.tableNumber ? `Table ${reservation.tableNumber}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {new Date(reservation.reservationTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
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
