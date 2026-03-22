'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Analytics {
  weeklyRevenue: number[]
  weeklyOrders: number[]
  topItems: Array<{ name: string; count: number; revenue: number }>
  staffPerformance: Array<{ name: string; orders: number; revenue: number }>
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics?range=${timeRange}`)
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (err) {
      console.log('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const maxRevenue = Math.max(...(analytics?.weeklyRevenue || [1]), 1)
  const maxOrders = Math.max(...(analytics?.weeklyOrders || [1]), 1)

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            📊 Analytics & Reports
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Weekly performance and insights</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition shadow-md"
        >
          ← Back
        </button>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2 mb-8">
        {['day', 'week', 'month'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-6 py-3 font-bold rounded-lg capitalize transition shadow-md ${
              timeRange === range
                ? 'bg-lime-600 text-white'
                : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:border-lime-500'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-600 dark:text-slate-400">Loading analytics...</div>
        </div>
      ) : !analytics ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-600 dark:text-slate-400">No data available</div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Weekly Revenue</h2>
            <div className="flex items-end justify-around gap-4 h-64">
              {analytics.weeklyRevenue.map((revenue, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t relative group">
                    <div
                      className="w-full bg-linear-to-t from-emerald-500 to-emerald-400 rounded-t transition hover:from-emerald-600"
                      style={{ height: `${(revenue / maxRevenue) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 dark:bg-white px-2 py-1 rounded text-xs text-white dark:text-slate-900 opacity-0 group-hover:opacity-100 transition whitespace-nowrap font-bold">
                        ${revenue}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-semibold">{days[i]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Weekly Orders</h2>
            <div className="flex items-end justify-around gap-4 h-48">
              {analytics.weeklyOrders.map((orders, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t relative group">
                    <div
                      className="w-full bg-linear-to-t from-blue-500 to-blue-400 rounded-t transition hover:from-blue-600"
                      style={{ height: `${(orders / maxOrders) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 dark:bg-white px-2 py-1 rounded text-xs text-white dark:text-slate-900 opacity-0 group-hover:opacity-100 transition whitespace-nowrap font-bold">
                        {orders}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-semibold">{days[i]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Items & Staff Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Items */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Top Selling Items</h2>
              <div className="space-y-3">
                {analytics.topItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.count} sold</p>
                    </div>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">${item.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff Performance */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Staff Performance</h2>
              <div className="space-y-3">
                {analytics.staffPerformance.map((staff, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{staff.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{staff.orders} orders</p>
                    </div>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">${staff.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
