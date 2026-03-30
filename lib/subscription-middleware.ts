// @ts-ignore
import { NextRequest, NextResponse } from 'next/server'
import { subscriptionService } from '@/lib/subscription-service'

// @ts-ignore
const jwt = require('jsonwebtoken')

// @ts-ignore
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    username: string
  } | null
  subscription?: {
    isValid: boolean
    status: string
    daysRemaining: number
  } | null
}

/**
 * Middleware to check authentication and subscription status
 */
export async function withAuthAndSubscription(
  request: NextRequest,
  options: {
    requireAuth?: boolean
    requireActiveSubscription?: boolean
    allowedActions?: string[]
  } = {}
): Promise<{ request: AuthenticatedRequest; response?: NextResponse }> {
  const { requireAuth = true, requireActiveSubscription = true, allowedActions = [] } = options

  // Extract token from Authorization header
  const authHeader = request.headers.get('authorization')
  let token: string | null = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }

  // If auth is required but no token, return 401
  if (requireAuth && !token) {
    return {
      request,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  let user = null

  // Verify token if present
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      user = {
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username || decoded.name
      }
    } catch (error) {
      if (requireAuth) {
        return {
          request,
          response: NextResponse.json(
            { error: 'Invalid token' },
            { status: 401 }
          )
        }
      }
    }
  }

  // Check system date manipulation
  if (user) {
    const dateValidation = await subscriptionService.validateSystemDate(user.userId)
    if (!dateValidation.isValid) {
      return {
        request,
        response: NextResponse.json(
          { error: dateValidation.message },
          { status: 403 }
        )
      }
    }
  }

  // Check subscription if user is authenticated
  let subscription = null
  if (user) {
    const subscriptionCheck = await subscriptionService.checkSubscription(user.userId)
    subscription = {
      isValid: subscriptionCheck.isValid,
      status: subscriptionCheck.status,
      daysRemaining: subscriptionCheck.daysRemaining
    }

    // If active subscription is required but subscription is invalid
    if (requireActiveSubscription && !subscriptionCheck.isValid) {
      // Check if the current action is allowed in restricted mode
      const url = new URL(request.url)
      const action = getActionFromUrl(url.pathname)

      if (!subscriptionService.isActionAllowed(action) && !allowedActions.includes(action)) {
        return {
          request,
          response: NextResponse.json(
            {
              error: 'Subscription expired',
              message: 'Your subscription has expired. Please renew to continue using this feature.',
              subscription: subscriptionCheck
            },
            { status: 403 }
          )
        }
      }
    }
  }

  // Attach user and subscription to request
  const authenticatedRequest = request as AuthenticatedRequest
  authenticatedRequest.user = user
  authenticatedRequest.subscription = subscription

  return { request: authenticatedRequest }
}

/**
 * Extract action from URL path
 */
function getActionFromUrl(pathname: string): string {
  if (pathname.includes('/orders')) return 'view_orders'
  if (pathname.includes('/payments') || pathname.includes('/billing')) return 'take_payments'
  if (pathname.includes('/print') || pathname.includes('/bills')) return 'print_bills'
  if (pathname.includes('/export')) return 'export_data'
  if (pathname.includes('/tables') && pathname.includes('/close')) return 'close_tables'
  if (pathname.includes('/generate')) return 'generate_bills'

  // Default actions that are blocked
  if (pathname.includes('/menu') && (pathname.includes('/create') || pathname.includes('/update'))) return 'create_menu_items'
  if (pathname.includes('/inventory')) return 'update_inventory'
  if (pathname.includes('/settings')) return 'access_settings'
  if (pathname.includes('/reports')) return 'view_reports'

  return 'unknown'
}

/**
 * Higher-order function for API routes that need auth and subscription
 */
export function withSubscriptionCheck(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    requireActiveSubscription?: boolean
    allowedActions?: string[]
  } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { request, response } = await withAuthAndSubscription(req, options)

    if (response) {
      return response
    }

    return handler(request)
  }
}
