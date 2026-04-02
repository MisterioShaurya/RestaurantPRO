'use client'

import { useState } from 'react'
import { Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { Subscription } from '@/lib/types'

interface RestrictedModeProps {
  subscription: Subscription
  onRenewal?: () => void
  children: React.ReactNode
}

export function RestrictedMode({ subscription, onRenewal, children }: RestrictedModeProps) {
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [showRenewalModal, setShowRenewalModal] = useState(false)
  const [unlockCode, setUnlockCode] = useState('')
  const [renewalType, setRenewalType] = useState<'MONTHLY' | 'YEARLY'>(subscription.subscription_type)
  const [unlockError, setUnlockError] = useState('')
  const [renewalError, setRenewalError] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [renewing, setRenewing] = useState(false)

  const isRestrictedStatus = subscription.status === 'RESTRICTED'
  const isGraceStatus = subscription.status === 'GRACE'
  const shouldShowRestricted = isRestrictedStatus || isGraceStatus

  const getPricing = (type: 'MONTHLY' | 'YEARLY') => {
    return type === 'MONTHLY' ? 999 : 9999
  }

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
      window.location.reload()
    } catch (err) {
      setUnlockError('Network error. Please try again.')
    } finally {
      setUnlocking(false)
    }
  }

  const handleRenewal = async () => {
    setRenewing(true)
    setRenewalError('')

    try {
      const response = await fetch('/api/subscription/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionType: renewalType }),
      })

      const data = await response.json()

      if (!response.ok) {
        setRenewalError(data.message || 'Renewal failed')
        return
      }

      setShowRenewalModal(false)
      onRenewal?.()
      window.location.reload()
    } catch (err) {
      setRenewalError('Network error. Please try again.')
    } finally {
      setRenewing(false)
    }
  }

  if (!shouldShowRestricted) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Restricted Mode Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isGraceStatus ? 'Subscription Expiring Soon' : 'Subscription Restricted'}
            </h2>
            <p className="text-gray-600">
              {isGraceStatus
                ? 'Your subscription is expiring soon. Renew now to continue using all features.'
                : 'Your subscription has been restricted. Renew or enter an unlock code to continue using essential features.'
              }
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setShowUnlockModal(true)}
              className="w-full"
              variant="outline"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Enter Unlock Code
            </Button>

            <Button
              onClick={() => setShowRenewalModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Renew Subscription
            </Button>
          </div>

          <Alert className="mt-4 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Essential features only:</strong> You can still process orders and manage basic operations, but advanced features are restricted.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Render children with reduced opacity */}
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>

      {/* Unlock Code Modal */}
      <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
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

      {/* Renewal Modal */}
      <Dialog open={showRenewalModal} onOpenChange={setShowRenewalModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Renew Subscription
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Choose Plan</Label>
              <p className="text-sm text-gray-600 mt-1">
                Select your renewal plan
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="monthly-renewal"
                  name="renewal-type"
                  value="MONTHLY"
                  checked={renewalType === 'MONTHLY'}
                  onChange={(e) => setRenewalType(e.target.value as 'MONTHLY')}
                  className="text-blue-600"
                />
                <Label htmlFor="monthly-renewal" className="flex-1 cursor-pointer">
                  <div className="flex justify-between">
                    <span>Monthly Plan</span>
                    <span className="font-semibold">₹999/month</span>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="yearly-renewal"
                  name="renewal-type"
                  value="YEARLY"
                  checked={renewalType === 'YEARLY'}
                  onChange={(e) => setRenewalType(e.target.value as 'YEARLY')}
                  className="text-blue-600"
                />
                <Label htmlFor="yearly-renewal" className="flex-1 cursor-pointer">
                  <div className="flex justify-between">
                    <span>Yearly Plan</span>
                    <span className="font-semibold">₹9,999/year</span>
                  </div>
                  <p className="text-xs text-green-600">Save ₹989 compared to monthly</p>
                </Label>
              </div>
            </div>

            {renewalError && (
              <Alert variant="destructive">
                <AlertDescription>{renewalError}</AlertDescription>
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
                disabled={renewing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {renewing ? 'Processing...' : `Renew for ₹${getPricing(renewalType).toLocaleString()}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}