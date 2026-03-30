import { NextRequest, NextResponse } from 'next/server'
import { withSubscriptionCheck } from '@/lib/subscription-middleware'
import { subscriptionService } from '@/lib/subscription-service'

/**
 * POST /api/subscription/unlock
 * Unlock subscription with secret code
 */
export const POST = withSubscriptionCheck(
  async (req) => {
    try {
      if (!req.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { unlockCode } = await req.json()

      if (!unlockCode) {
        return NextResponse.json(
          { error: 'Unlock code is required' },
          { status: 400 }
        )
      }

      const result = await subscriptionService.renewWithUnlockCode(req.user.userId, unlockCode)

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message
        })
      } else {
        return NextResponse.json(
          { error: result.message },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Error unlocking subscription:', error)
      return NextResponse.json(
        { error: 'Failed to unlock subscription' },
        { status: 500 }
      )
    }
  },
  { requireAuth: true, requireActiveSubscription: false }
)
