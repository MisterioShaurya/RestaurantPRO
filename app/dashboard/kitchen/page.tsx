'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChefNotifications } from '@/components/chef-notifications'
import { Check, LogOut } from 'lucide-react'

interface KOTItem {
  name: string
  quantity: number
  qty?: number
  _id?: string
  price?: number
}

interface KOT {
  _id: string
  id?: string
  orderNumber?: string
  tableNumber?: number | null
  items: KOTItem[]
  status?: string
  kotStatus?: 'active' | 'preparing' | 'done' | 'cancelled'
  createdAt: string
  kotNumber?: number
  kotCount?: number
  isDone?: boolean
}

export default function KitchenKOTPage() {
  const router = useRouter()
  const [kots, setKots] = useState<KOT[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [updatingKotIds, setUpdatingKotIds] = useState<Set<string>>(new Set())
  const fetchCounter = useRef(0)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try { setUser(JSON.parse(userStr)) } catch {}
    }
    
    let cancelled = false
    const counter = ++fetchCounter.current
    
    const fetchKOTs = async () => {
      // Guard: only run if this is still the current fetch cycle
      if (counter !== fetchCounter.current) return
      
      try {
        // Use dedicated chef-today endpoint which handles filtering server-side
        const res = await fetch('/api/kot/chef-today').catch(() => null)
        
        if (!res || !res.ok) {
          console.log('[Chef] Falling back to combined fetch')
          // Fallback: get from both endpoints
          const [ordersRes, kotsRes] = await Promise.all([
            fetch('/api/kitchen/orders').catch(() => null),
            fetch('/api/kot').catch(() => null),
          ])

          let allKOTs: KOT[] = []

          if (ordersRes && ordersRes.ok) {
            const data = await ordersRes.json()
            const orders = Array.isArray(data.orders) ? data.orders : []
            allKOTs = [...allKOTs, ...orders]
          }

          if (kotsRes && kotsRes.ok) {
            const data = await kotsRes.json()
            const kotsList = Array.isArray(data.kots) ? data.kots : []
            allKOTs = [...allKOTs, ...kotsList]
          }

          const map = new Map<string, KOT>()
          for (const k of allKOTs) {
            const key = k._id || k.id || ''
            if (!key) continue
            const existing = map.get(key)
            if (!existing || new Date(k.createdAt || 0).getTime() > new Date(existing.createdAt || 0).getTime()) {
              map.set(key, k as KOT)
            }
          }

          const today = new Date()
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
          
          const activeKOTs = Array.from(map.values())
            .filter(k => {
              const status = k.kotStatus || k.status || 'active'
              if (status === 'done' || status === 'completed') return false
              try {
                const created = new Date(k.createdAt)
                return created >= todayStart
              } catch {
                return true
              }
            })
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

          if (!cancelled && counter === fetchCounter.current) {
            setKots(activeKOTs)
          }
          return
        }

        const data = await res.json()
        const kotsList: KOT[] = Array.isArray(data.kots) ? data.kots : []
        
        // REPLACE state entirely - never append
        if (!cancelled && counter === fetchCounter.current) {
          setKots(kotsList)
        }
      } catch (err) {
        console.log('Error fetching KOTs:', err)
      } finally {
        if (!cancelled && counter === fetchCounter.current) {
          setLoading(false)
        }
      }
    }

    fetchKOTs()
    const interval = setInterval(fetchKOTs, 5000) // 5s polling

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const handleLogout = async () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('currentUser')
    document.cookie = 'token=; path=/; max-age=0'
    document.cookie = 'userRole=; path=/; max-age=0'
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    router.push('/login')
  }

  // Each KOT card uses its own unique _id - no shared variables
  const updateKOTStatus = useCallback(async (kotId: string, newStatus: 'preparing' | 'done') => {
    if (updatingKotIds.has(kotId)) {
      console.log(`[KOT] Already updating ${kotId}, ignoring duplicate`)
      return
    }
    
    setUpdatingKotIds(prev => new Set(prev).add(kotId))

    try {
      console.log(`[KOT] Updating ${kotId} to ${newStatus}`)
      
      // Update via KOT API with proper status field
      const res = await fetch(`/api/kot/${kotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kotStatus: newStatus }),
      })

      if (!res.ok) {
        throw new Error('API call failed')
      }
      
      console.log(`[KOT] Successfully updated ${kotId} to ${newStatus}`)
      
      // Optimistically update local state - REPLACE, never append
      setKots(prev => prev.filter(k => {
        const key = k._id || k.id
        return key !== kotId
      }))
      
    } catch (err) {
      console.error(`[KOT] Error updating ${kotId}:`, err)
      alert('Failed to update KOT status. Please try again.')
      // State will be refreshed on next poll
    } finally {
      setUpdatingKotIds(prev => {
        const next = new Set(prev)
        next.delete(kotId)
        return next
      })
    }
  }, [updatingKotIds])

  const getStatusColor = (kot: KOT) => {
    const status = kot.kotStatus || kot.status || 'pending'
    switch (status) {
      case 'pending':
        return 'border-l-4 border-red-500 bg-red-50'
      case 'preparing':
        return 'border-l-4 border-orange-500 bg-orange-50'
      case 'cancelled':
        return 'border-l-4 border-gray-400 bg-gray-100'
      default:
        return 'border-l-4 border-gray-500 bg-gray-50'
    }
  }

  const getItemsList = (kot: KOT) => {
    return (kot.items || []).map(item => ({
      name: item.name,
      qty: item.quantity || item.qty || 1,
    }))
  }

  // BUG 2: Separate pending/preparing from cancelled
  const pendingKOTs = kots.filter(k => (k.kotStatus || k.status || 'pending') === 'pending')
  const preparingKOTs = kots.filter(k => (k.kotStatus || k.status || 'pending') === 'preparing')
  const cancelledKOTs = kots.filter(k => (k.kotStatus || k.status || 'pending') === 'cancelled')

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-yellow-50 to-orange-50 p-4 sm:p-6 lg:p-8">
      <ChefNotifications />
      
      {/* Header with Logout */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              🔥 KOT - Kitchen Orders
            </h1>
            <p className="text-lg text-gray-600">
              Today's orders — {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-500 hidden sm:block">
                {user.name || user.username} ({user.role})
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition shadow-md active:scale-95 flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition shadow-md active:scale-95"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Count stats - No revenue */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 card-shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-600 font-semibold uppercase">Pending</p>
          <p className="text-4xl font-bold text-red-600 mt-2">{pendingKOTs.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow border-l-4 border-orange-500">
          <p className="text-sm text-gray-600 font-semibold uppercase">Preparing</p>
          <p className="text-4xl font-bold text-orange-600 mt-2">{preparingKOTs.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow border-l-4 border-gray-400">
          <p className="text-sm text-gray-600 font-semibold uppercase">Cancelled</p>
          <p className="text-4xl font-bold text-gray-600 mt-2">{cancelledKOTs.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-600 text-lg">Loading kitchen orders...</div>
        </div>
      ) : kots.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍳</div>
          <div className="text-gray-600 text-lg font-semibold">No active KOTs</div>
          <div className="text-gray-500 text-sm mt-2">New orders will appear here</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending KOTs */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-red-700 flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-red-500" />
              Pending
              {pendingKOTs.length > 0 && (
                <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">
                  {pendingKOTs.length}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {pendingKOTs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl card-shadow">No pending KOTs</div>
              ) : (
                pendingKOTs.map((kot) => {
                  const key = kot._id || kot.id || Math.random().toString()
                  const items = getItemsList(kot)
                  const isUpdating = updatingKotIds.has(key)
                  return (
                    <div key={key} className={`p-6 rounded-2xl card-shadow hover:card-shadow-hover transition-all duration-200 ${getStatusColor(kot)}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-3xl font-bold text-gray-900">🍽️ Table {kot.tableNumber || 'Walk-in'}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            KOT #{kot.kotNumber || kot.kotCount || '—'} •{' '}
                            {kot.createdAt ? new Date(kot.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4 bg-white/60 p-4 rounded-lg">
                        {items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-gray-900">
                            <span className="font-medium">{item.name}</span>
                            <span className="font-bold text-red-600 bg-red-100 px-3 py-1 rounded-lg">×{item.qty}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => updateKOTStatus(key, 'preparing')}
                          disabled={isUpdating}
                          className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition shadow-md active:scale-95"
                        >
                          {isUpdating ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            '🔥 Preparing'
                          )}
                        </button>
                        <button
                          onClick={() => updateKOTStatus(key, 'done')}
                          disabled={isUpdating}
                          className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition shadow-md active:scale-95"
                        >
                          {isUpdating ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <><Check className="inline mr-1" size={18} /> Done</>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Preparing KOTs */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-orange-700 flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-orange-500" />
              Preparing
              {preparingKOTs.length > 0 && (
                <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">
                  {preparingKOTs.length}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {preparingKOTs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl card-shadow">No orders being prepared</div>
              ) : (
                preparingKOTs.map((kot) => {
                  const key = kot._id || kot.id || Math.random().toString()
                  const items = getItemsList(kot)
                  const isUpdating = updatingKotIds.has(key)
                  return (
                    <div key={key} className="p-5 rounded-lg shadow-md transition hover:shadow-lg bg-orange-50 border-l-4 border-orange-500">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-2xl font-bold text-slate-900">🍽️ Table {kot.tableNumber || 'Walk-in'}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            KOT #{kot.kotNumber || kot.kotCount || '—'} •{' '}
                            {kot.createdAt ? new Date(kot.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4 bg-white/50 p-3 rounded">
                        {items.map((item, i) => (
                          <div key={i} className="flex justify-between text-slate-900">
                            <span className="font-medium">{item.name}</span>
                            <span className="font-bold text-blue-600">×{item.qty}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => updateKOTStatus(key, 'done')}
                        disabled={isUpdating}
                        className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition shadow-md active:scale-95"
                      >
                        {isUpdating ? (
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><Check className="inline mr-1" size={18} /> Mark Done</>
                        )}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Cancelled KOTs - Only show "Done" button (no Preparing) */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-gray-400" />
              Cancelled
              {cancelledKOTs.length > 0 && (
                <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-bold">
                  {cancelledKOTs.length}
                </span>
              )}
            </h2>
            <div className="space-y-4">
              {cancelledKOTs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl card-shadow">No cancelled KOTs</div>
              ) : (
                cancelledKOTs.map((kot) => {
                  const key = kot._id || kot.id || Math.random().toString()
                  const items = getItemsList(kot)
                  const isUpdating = updatingKotIds.has(key)
                  return (
                    <div key={key} className="p-5 rounded-lg shadow-md bg-gray-100 border-l-4 border-gray-400">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-2xl font-bold text-slate-900">🍽️ Table {kot.tableNumber || 'Walk-in'}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            KOT #{kot.kotNumber || kot.kotCount || '—'} •{' '}
                            {kot.createdAt ? new Date(kot.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                          <span className="inline-block mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded-full font-bold">🚫 CANCELLED</span>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4 bg-white/50 p-3 rounded">
                        {items.map((item, i) => (
                          <div key={i} className="flex justify-between text-slate-900">
                            <span className="font-medium">{item.name}</span>
                            <span className="font-bold text-gray-500">×{item.qty}</span>
                          </div>
                        ))}
                      </div>
                      {/* BUG 2: Cancelled KOTs only show Done button */}
                      <button
                        onClick={() => updateKOTStatus(key, 'done')}
                        disabled={isUpdating}
                        className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition shadow-md active:scale-95"
                      >
                        {isUpdating ? (
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><Check className="inline mr-1" size={18} /> Acknowledge & Done</>
                        )}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}