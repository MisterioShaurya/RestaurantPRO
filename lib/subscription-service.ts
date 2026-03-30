import { getMongoClient } from './mongodb'
import { Subscription, SubscriptionType, SubscriptionStatus, SubscriptionCheckResult } from './types'

export class SubscriptionService {
  private static instance: SubscriptionService

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService()
    }
    return SubscriptionService.instance
  }

  /**
   * Check subscription status for a user
   */
  async checkSubscription(userId: string): Promise<SubscriptionCheckResult> {
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')

      const subscription = await db.collection('subscriptions').findOne({
        business_id: userId
      }) as Subscription | null

      if (!subscription) {
        return {
          isValid: false,
          status: 'RESTRICTED',
          daysRemaining: 0,
          subscription: null,
          message: 'No active subscription found'
        }
      }

      const now = new Date()
      const expiryDate = new Date(subscription.subscription_expiry_date)
      const graceExpiryDate = new Date(expiryDate.getTime() + (subscription.grace_period_days * 24 * 60 * 60 * 1000))

      let status: SubscriptionStatus
      let daysRemaining: number
      let isValid: boolean

      if (now <= expiryDate) {
        status = 'ACTIVE'
        daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        isValid = true
      } else if (now <= graceExpiryDate) {
        status = 'GRACE'
        daysRemaining = Math.ceil((graceExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        isValid = true
      } else {
        status = 'RESTRICTED'
        daysRemaining = 0
        isValid = false
      }

      // Update last login time
      await db.collection('subscriptions').updateOne(
        { business_id: userId },
        { $set: { last_login_time: now, updated_at: now } }
      )

      return {
        isValid,
        status,
        daysRemaining,
        subscription
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
      return {
        isValid: false,
        status: 'RESTRICTED',
        daysRemaining: 0,
        subscription: null,
        message: 'Error checking subscription'
      }
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    userId: string,
    userName: string,
    subscriptionType: SubscriptionType,
    gracePeriodDays: number = 5
  ): Promise<Subscription> {
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const startDate = new Date()
    const expiryDate = new Date(startDate)

    if (subscriptionType === 'MONTHLY') {
      expiryDate.setDate(expiryDate.getDate() + 30)
    } else {
      expiryDate.setDate(expiryDate.getDate() + 365)
    }

    const subscription: Omit<Subscription, '_id'> = {
      business_id: userId,
      user_name: userName,
      subscription_type: subscriptionType,
      subscription_start_date: startDate,
      subscription_expiry_date: expiryDate,
      grace_period_days: gracePeriodDays,
      status: 'ACTIVE',
      last_payment_date: startDate,
      last_login_time: startDate,
      is_unlocked_by_code: false,
      created_at: startDate,
      updated_at: startDate
    }

    const result = await db.collection('subscriptions').insertOne(subscription)

    return {
      _id: result.insertedId.toString(),
      ...subscription
    }
  }

  /**
   * Renew subscription using unlock code
   */
  async renewWithUnlockCode(userId: string, unlockCode: string): Promise<{ success: boolean; message: string }> {
    const POS_SECRET_CODE = process.env.POS_SECRET_CODE || 'RENEW123'

    if (unlockCode !== POS_SECRET_CODE) {
      return { success: false, message: 'Invalid unlock code' }
    }

    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')

      const subscription = await db.collection('subscriptions').findOne({
        business_id: userId
      }) as Subscription | null

      if (!subscription) {
        return { success: false, message: 'No subscription found' }
      }

      const now = new Date()
      const newStartDate = new Date(now)
      const newExpiryDate = new Date(now)

      if (subscription.subscription_type === 'MONTHLY') {
        newExpiryDate.setDate(newExpiryDate.getDate() + 30)
      } else {
        newExpiryDate.setDate(newExpiryDate.getDate() + 365)
      }

      await db.collection('subscriptions').updateOne(
        { business_id: userId },
        {
          $set: {
            subscription_start_date: newStartDate,
            subscription_expiry_date: newExpiryDate,
            status: 'ACTIVE',
            last_payment_date: now,
            last_login_time: now,
            is_unlocked_by_code: true,
            updated_at: now
          }
        }
      )

      return { success: true, message: 'Subscription renewed successfully' }
    } catch (error) {
      console.error('Error renewing subscription:', error)
      return { success: false, message: 'Error renewing subscription' }
    }
  }

  /**
   * Check if system date has been manipulated
   */
  async validateSystemDate(userId: string): Promise<{ isValid: boolean; message?: string }> {
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')

      const subscription = await db.collection('subscriptions').findOne({
        business_id: userId
      }) as Subscription | null

      if (!subscription || !subscription.last_login_time) {
        return { isValid: true } // First login
      }

      const now = new Date()
      const lastLogin = new Date(subscription.last_login_time)

      // Check if system date is before last login (date manipulation)
      if (now < lastLogin) {
        return {
          isValid: false,
          message: 'System date changed. Please correct your device date.'
        }
      }

      return { isValid: true }
    } catch (error) {
      console.error('Error validating system date:', error)
      // Return isValid: true on connection errors to allow access
      // This prevents MongoDB connection issues from blocking
      return { isValid: true }
    }
  }

  /**
   * Get subscription reminders
   */
  async getReminders(userId: string): Promise<Array<{ days: number; message: string }>> {
    try {
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')

      const subscription = await db.collection('subscriptions').findOne({
        business_id: userId,
        status: { $in: ['ACTIVE', 'GRACE'] }
      }) as Subscription | null

      if (!subscription) {
        return []
      }

      const now = new Date()
      const expiryDate = new Date(subscription.subscription_expiry_date)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      const reminders: Array<{ days: number; message: string }> = []

      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        reminders.push({
          days: daysUntilExpiry,
          message: `Your subscription will expire in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}. Please renew to avoid restricted access.`
        })
      }

      return reminders
    } catch (error) {
      console.error('Error getting reminders:', error)
      return []
    }
  }

  /**
   * Check if action is allowed in restricted mode
   */
  isActionAllowed(action: string): boolean {
    const allowedActions = [
      'view_orders',
      'print_bills',
      'take_payments',
      'export_data',
      'close_tables',
      'generate_bills'
    ]

    return allowedActions.includes(action)
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(userId: string): Promise<void> {
    try {
      const checkResult = await this.checkSubscription(userId)

      if (checkResult.subscription) {
        const client = await getMongoClient()
        const db = client.db('restaurant_pos')

        await db.collection('subscriptions').updateOne(
          { business_id: userId },
          {
            $set: {
              status: checkResult.status,
              updated_at: new Date()
            }
          }
        )
      }
    } catch (error) {
      console.error('Error updating subscription status:', error)
    }
  }
}

export const subscriptionService = SubscriptionService.getInstance()
