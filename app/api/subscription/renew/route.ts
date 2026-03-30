import { NextRequest, NextResponse } from 'next/server'
import { withSubscriptionCheck } from '@/lib/subscription-middleware'
import { subscriptionService } from '@/lib/subscription-service'
import { getMongoClient } from '@/lib/mongodb'

export const POST = withSubscriptionCheck(
  async (req) => {
    try {
      const { subscriptionType } = await req.json()

      if (!subscriptionType || !['MONTHLY', 'YEARLY'].includes(subscriptionType)) {
        return NextResponse.json(
          { message: 'Invalid subscription type' },
          { status: 400 }
        )
      }

      const result = await subscriptionService.renewSubscription(req.user!.userId, subscriptionType)

      if (!result.success) {
        return NextResponse.json(
          { message: result.message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        message: 'Subscription renewed successfully',
        subscription: result.subscription
      })
    } catch (error) {
      console.error('Error renewing subscription:', error)
      return NextResponse.json(
        { message: 'Failed to renew subscription' },
        { status: 500 }
      )
    }
  },
  { requireAuth: true, requireActiveSubscription: false }
)
