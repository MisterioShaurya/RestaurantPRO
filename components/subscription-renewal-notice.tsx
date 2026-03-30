'use client'

import { useState } from 'react'
import { CreditCard, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SubscriptionRenewalNoticeProps {
  subscription: {
    status: 'ACTIVE' | 'EXPIRED' | 'GRACE_PERIOD' | 'SUSPENDED'
    type: 'MONTHLY' | 'YEARLY'
    expiresAt: string
    gracePeriodEndsAt?: string
  }
  onRenewal?: () => void
}

export function SubscriptionRenewalNotice({ subscription, onRenewal }: SubscriptionRenewalNoticeProps) {
  const [showRenewalModal, setShowRenewalModal] = useState(false)
  const [renewalType, setRenewalType] = useState<'MONTHLY' | 'YEARLY'>(subscription.type)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const isExpired = subscription.status === 'EXPIRED'
  const isGracePeriod = subscription.status === 'GRACE_PERIOD'
  const isSuspended = subscription.status === 'SUSPENDED'

  const getPricing = (type: 'MONTHLY' | 'YEARLY') => {
    return type === 'MONTHLY' ? 999 : 9999
  }

  const handleRenewal = async () => {
    setProcessing(true)
    setError('')

    try {
      // In a real implementation, this would integrate with a payment gateway
      // For now, we'll simulate the renewal process
      const response = await fetch('/api/subscription/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionType: renewalType }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Renewal failed')
        return
      }

      setShowRenewalModal(false)
      onRenewal?.()
      // Reload page to refresh subscription status
      window.location.reload()
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const getNoticeContent = () => {
    if (isExpired) {
      return {
        title: 'Subscription Expired',
        message: 'Your subscription has expired. Renew now to continue using all features.',
        severity: 'high' as const
      }
    }

    if (isGracePeriod) {
      const daysLeft = Math.ceil((new Date(subscription.gracePeriodEndsAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return {
        title: 'Grace Period Active',
        message: `You have ${daysLeft} days left in your grace period. Renew now to avoid service interruption.`,
        severity: 'medium' as const
      }
    }

    if (isSuspended) {
      return {
        title: 'Subscription Suspended',
        message: 'Your subscription has been suspended. Please contact support to resolve this issue.',
        severity: 'high' as const
      }
    }

    return null
  }

  const noticeContent = getNoticeContent()

  if (!noticeContent) return null

  return (
    <>
      <Alert className={`border-l-4 ${
        noticeContent.severity === 'high'
          ? 'border-l-red-500 bg-red-50'
          : 'border-l-yellow-500 bg-yellow-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${
              noticeContent.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <div>
              <AlertDescription className="font-medium">
                {noticeContent.title}
              </AlertDescription>
              <AlertDescription className="text-sm mt-1">
                {noticeContent.message}
              </AlertDescription>
            </div>
          </div>
          {!isSuspended && (
            <Button
              size="sm"
              variant={noticeContent.severity === 'high' ? 'destructive' : 'default'}
              onClick={() => setShowRenewalModal(true)}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Renew Now
            </Button>
          )}
        </div>
      </Alert>

      {/* Renewal Modal */}
      <Dialog open={showRenewalModal} onOpenChange={setShowRenewalModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Renew Subscription
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Current Plan: {subscription.type}</Label>
              <p className="text-sm text-gray-600 mt-1">
                Choose your renewal plan
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="monthly"
                  name="renewal-type"
                  value="MONTHLY"
                  checked={renewalType === 'MONTHLY'}
                  onChange={(e) => setRenewalType(e.target.value as 'MONTHLY')}
                  className="text-blue-600"
                />
                <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                  <div className="flex justify-between">
                    <span>Monthly Plan</span>
                    <span className="font-semibold">₹999/month</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="yearly"
                  name="renewal-type"
                  value="YEARLY"
                  checked={renewalType === 'YEARLY'}
                  onChange={(e) => setRenewalType(e.target.value as 'YEARLY')}
                  className="text-blue-600"
                />
                <Label htmlFor="yearly" className="flex-1 cursor-pointer">
                  <div className="flex justify-between">
                    <span>Yearly Plan</span>
                    <span className="font-semibold">₹9,999/year</span>
                  </div>
                  <p className="text-xs text-green-600">Save ₹989 compared to monthly</p>
                </Label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowRenewalModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRenewal}
                disabled={processing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {processing ? 'Processing...' : `Renew for ₹${getPricing(renewalType).toLocaleString()}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
