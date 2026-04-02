'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SubscriptionBanner } from '@/components/subscription-banner'
import { SubscriptionRenewalNotice } from '@/components/subscription-renewal-notice'
import { RestrictedMode } from '@/components/restricted-mode'
import { Subscription } from '@/lib/types'
import { persistentUserStorage } from '@/lib/persistent-user-storage'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOfflineUser, setIsOfflineUser] = useState(false)

  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    try {
      // Check for offline user first
      const offlineUser = persistentUserStorage.getCurrentUser()
      if (offlineUser) {
        console.log('[Dashboard Layout] Offline user detected, skipping subscription check')
        setIsOfflineUser(true)
        // Create a mock active subscription for offline users
        setSubscription({
          business_id: offlineUser.id,
          user_name: offlineUser.name,
          subscription_type: 'MONTHLY',
          subscription_start_date: new Date(),
          subscription_expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          grace_period_days: 7,
          status: 'ACTIVE',
          is_unlocked_by_code: false,
          created_at: new Date(),
          updated_at: new Date()
        })
        setLoading(false)
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/subscription/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
        return
      }

      if (!response.ok) {
        setError('Failed to check subscription')
        return
      }

      const data = await response.json()

      setSubscription(data.subscription)
    } catch (err) {
      console.error('Subscription check error:', err)
      // If it's an offline user, don't show network error
      const offlineUser = persistentUserStorage.getCurrentUser()
      if (offlineUser) {
        setIsOfflineUser(true)
        setSubscription({
          business_id: offlineUser.id,
          user_name: offlineUser.name,
          subscription_type: 'MONTHLY',
          subscription_start_date: new Date(),
          subscription_expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          grace_period_days: 7,
          status: 'ACTIVE',
          is_unlocked_by_code: false,
          created_at: new Date(),
          updated_at: new Date()
        })
      } else {
        setError('Network error. Please check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRenewal = () => {
    checkSubscription() // Refresh subscription status
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <p className="text-red-600 text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
          <p className="text-yellow-600 text-center">Unable to load subscription information</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <RestrictedMode subscription={subscription} onRenewal={handleRenewal}>
      <div className="min-h-screen bg-gray-50">
        {/* Subscription Banner */}
        <div className="sticky top-0 z-30">
          <SubscriptionBanner subscription={subscription} onRenewal={handleRenewal} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Subscription Renewal Notice */}
        <SubscriptionRenewalNotice subscription={subscription} onRenewal={handleRenewal} />
      </div>
    </RestrictedMode>
  )
}
