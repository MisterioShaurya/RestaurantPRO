import { NextRequest, NextResponse } from 'next/server'
import { withSubscriptionCheck } from '@/lib/subscription-middleware'
import { subscriptionService } from '@/lib/subscription-service'

/**
 * GET /api/subscription/check
 * Check current subscription status
 */
export const GET = withSubscriptionCheck(
  async (req) => {
    try {
      if (!req.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const result = await subscriptionService.checkSubscription(req.user.userId)
      const reminders = await subscriptionService.getReminders(req.user.userId)

      return NextResponse.json({
        subscription: result,
        reminders
      })
    } catch (error) {
      console.error('Error checking subscription:', error)
      return NextResponse.json(
        { error: 'Failed to check subscription' },
        { status: 500 }
      )
    }
  },
  { requireAuth: true, requireActiveSubscription: false }
)
