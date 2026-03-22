'use client'

import { useEffect, useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { persistentUserStorage } from '@/lib/persistent-user-storage'

export function SubscriptionRenewalNotice() {
  const [showNotice, setShowNotice] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(0)

  useEffect(() => {
    // Check on mount
    if (persistentUserStorage.shouldShowRenewalNotice()) {
      setDaysRemaining(persistentUserStorage.getDaysRemaining())
      setShowNotice(true)
    }

    // Check every hour
    const interval = setInterval(() => {
      if (persistentUserStorage.shouldShowRenewalNotice()) {
        setDaysRemaining(persistentUserStorage.getDaysRemaining())
        setShowNotice(true)
      } else {
        setShowNotice(false)
      }
    }, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (!showNotice) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 border-2 border-amber-400 dark:border-amber-600 rounded-xl shadow-2xl p-6 backdrop-blur-sm">
        {/* Close Button */}
        <button
          onClick={() => setShowNotice(false)}
          className="absolute top-3 right-3 p-1.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-lg transition"
        >
          <X size={18} className="text-amber-700 dark:text-amber-200" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle size={28} className="text-amber-600 dark:text-amber-300 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">
              Subscription Renewal Required
            </h3>
          </div>
        </div>

        {/* Message */}
        <div className="mb-4 text-sm">
          <p className="text-amber-800 dark:text-amber-200 mb-2">
            Your subscription expires in <span className="font-bold text-lg text-amber-700 dark:text-amber-100">{daysRemaining}</span> day{daysRemaining !== 1 ? 's' : ''}.
          </p>
          <p className="text-amber-700 dark:text-amber-300">
            Please contact the administrator to renew your subscription and get the activation code to continue using the system after expiry.
          </p>
        </div>

        {/* Expiry Date */}
        <div className="bg-white dark:bg-amber-950 p-3 rounded-lg mb-4 border border-amber-200 dark:border-amber-700">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Expires On</p>
          <p className="text-sm font-bold text-amber-900 dark:text-amber-100 mt-1">
            {new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowNotice(false)}
          className="w-full py-2.5 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-lg transition shadow-md active:scale-95"
        >
          ✓ I Understand
        </button>
      </div>
    </div>
  )
}
