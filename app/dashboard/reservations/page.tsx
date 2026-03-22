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
  }, [])

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setReservations((prev) =>
        prev.map((res) => {
          if (res.expiresAt && res.status === 'confirmed') {
            const now = Date.now()
            const expiresTime = new Date(res.expiresAt).getTime()
            const remaining = Math.max(0, Math.floor((expiresTime - now) / 1000))
            
            // Auto-complete if timer expired
            if (remaining === 0) {
              updateReservationStatus(res._id, 'completed')
            }
            
            return { ...res, timeRemaining: remaining }
          }
          return res
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations')
      if (res.ok) {
        const data = await res.json()
        setReservations(data.reservations)
      }
    } catch (err) {
      console.log('Error fetching reservations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddReservation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const data = await res.json()
        setReservations([...reservations, data.reservation])
        setFormData({ customerName: '', customerPhone: '', guestCount: 2, tableNumber: undefined, reservationTime: '' })
        setShowForm(false)
      }
    } catch (err) {
      console.log('Error adding reservation:', err)
    }
  }

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      // If confirming, set expiration to 20 minutes from now
      let updates: any = { status }
      if (status === 'confirmed') {
        const expiresAt = new Date(Date.now() + 20 * 60 * 1000) // 20 minutes from now
        updates.expiresAt = expiresAt.toISOString()
      }

      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) => (r._id === id ? { ...r, ...updates } : r))
        )
      }
    } catch (err) {
      console.log('Error updating reservation:', err)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            📅 Reservations
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Manage customer bookings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition shadow-md"
          >
            ← Back
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition shadow-md"
          >
            {showForm ? 'Cancel' : '+ New Reservation'}
          </button>
        </div>
      </div>

      {/* Add Reservation Form */}
      {showForm && (
        <div className="mb-8 bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Reservation</h3>
          <form onSubmit={handleAddReservation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="555-1234"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Number of Guests</label>
              <input
                type="number"
                placeholder="2"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Table Number</label>
              <input
                type="number"
                placeholder="Optional"
                value={formData.tableNumber || ''}
                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reservation Time</label>
              <input
                type="datetime-local"
                value={formData.reservationTime}
                onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              className="md:col-span-2 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition"
            >
              Create Reservation
            </button>
          </form>
        </div>
      )}

      {/* Reservations Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-600 dark:text-slate-400">Loading reservations...</div>
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
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Timer</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {reservations.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{res.customerName}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{res.customerPhone}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{res.guestCount} people</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {new Date(res.reservationTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {res.status === 'confirmed' && res.timeRemaining !== undefined ? (
                        <div className={`font-bold ${res.timeRemaining > 300 ? 'text-emerald-600' : res.timeRemaining > 60 ? 'text-orange-600' : 'text-red-600'}`}>
                          ⏱️ {Math.floor(res.timeRemaining / 60)}:{(res.timeRemaining % 60).toString().padStart(2, '0')}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          res.status === 'confirmed'
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                            : res.status === 'cancelled'
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <select
                        value={res.status}
                        onChange={(e) => updateReservationStatus(res._id, e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
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
