'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X, Clock, CreditCard, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SubscriptionBannerProps {
  subscription: {
    status: 'ACTIVE' | 'EXPIRED' | 'GRACE_PERIOD' | 'SUSPENDED'
    type: 'MONTHLY' | 'YEARLY'
    expiresAt: string
    gracePeriodEndsAt?: string
  }
  onRenewal?: () => void
}

export function SubscriptionBanner({ subscription, onRenewal }: SubscriptionBannerProps) {
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [unlockCode, setUnlockCode] = useState('')
  const [unlockError, setUnlockError] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  const isExpired = subscription.status === 'EXPIRED'
  const isGracePeriod = subscription.status === 'GRACE_PERIOD'
  const isSuspended = subscription.status === 'SUSPENDED'

  const getBannerContent = () => {
    if (isExpired) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Subscription Expired',
        message: 'Your subscription has expired. Enter unlock code to continue.',
        variant: 'destructive' as const,
        action: 'Unlock'
      }
    }

    if (isGracePeriod) {
      const daysLeft = Math.ceil((new Date(subscription.gracePeriodEndsAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return {
        icon: <Clock className="h-4 w-4" />,
        title: 'Subscription Grace Period',
        message: `Your subscription expired. You have ${daysLeft} days left in grace period.`,
        variant: 'default' as const,
        action: 'Renew Now'
      }
    }

    if (isSuspended) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Subscription Suspended',
        message: 'Your subscription has been suspended. Contact support.',
        variant: 'destructive' as const,
        action: null
      }
    }

    // Active subscription - show renewal reminder if expiring soon
    const daysUntilExpiry = Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysUntilExpiry <= 7) {
      return {
        icon: <CreditCard className="h-4 w-4" />,
        title: 'Subscription Expiring Soon',
        message: `Your ${subscription.type.toLowerCase()} subscription expires in ${daysUntilExpiry} days.`,
        variant: 'default' as const,
        action: 'Renew Now'
      }
    }

    return null
  }

  const bannerContent = getBannerContent()

  if (!bannerContent) return null

  const handleUnlock = async () => {
    if (!unlockCode.trim()) {
      setUnlockError('Please enter an unlock code')
      return
    }

    setUnlocking(true)
    setUnlockError('')

    try {
      const response = await fetch('/api/subscription/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unlockCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        setUnlockError(data.message || 'Invalid unlock code')
        return
      }

      setShowUnlockModal(false)
      setUnlockCode('')
      onRenewal?.()
      // Reload page to refresh subscription status
      window.location.reload()
    } catch (err) {
      setUnlockError('Network error. Please try again.')
    } finally {
      setUnlocking(false)
    }
  }

  const handleAction = () => {
    if (isExpired) {
      setShowUnlockModal(true)
    } else {
      onRenewal?.()
    }
  }

  return (
    <>
      <Alert className={`border-l-4 ${bannerContent.variant === 'destructive' ? 'border-l-red-500' : 'border-l-blue-500'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {bannerContent.icon}
            <div>
              <AlertDescription className="font-medium">
                {bannerContent.title}
              </AlertDescription>
              <AlertDescription className="text-sm mt-1">
                {bannerContent.message}
              </AlertDescription>
            </div>
          </div>
          {bannerContent.action && (
            <Button
              size="sm"
              variant={bannerContent.variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleAction}
            >
              {bannerContent.action}
            </Button>
          )}
        </div>
      </Alert>

      {/* Unlock Code Modal */}
      <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Enter Unlock Code
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="unlock-code">Unlock Code</Label>
              <Input
                id="unlock-code"
                type="text"
                placeholder="Enter your unlock code"
                value={unlockCode}
                onChange={(e) => setUnlockCode(e.target.value)}
                className="mt-1"
              />
              {unlockError && (
                <p className="text-sm text-red-600 mt-1">{unlockError}</p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowUnlockModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUnlock}
                disabled={unlocking}
              >
                {unlocking ? 'Unlocking...' : 'Unlock'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}