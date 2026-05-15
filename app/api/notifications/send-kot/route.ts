import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getServerSession } from '@/lib/auth'

// POST: Send push notification for new KOT to all chef devices
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, tableNumber, items } = await req.json()

    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    // Find all push subscriptions for chef role under this restaurant
    const subscriptions = await db.collection('push_subscriptions')
      .find({ 
        restaurantId: session.restaurantId,
        role: 'chef'
      })
      .toArray()

    if (subscriptions.length === 0) {
      // No chef subscriptions - that's okay
      return NextResponse.json({ message: 'No chef devices subscribed' })
    }

    // Build notification payload
    const itemNames = items?.map((i: any) => i.name || i.itemName).join(', ') || 'New items'
    const tableInfo = tableNumber ? `Table ${tableNumber}` : 'Walk-in'
    
    const notificationPayload = {
      title: '🍽️ New KOT Order',
      body: `${tableInfo}: ${itemNames}`,
      url: '/dashboard/order-logs',
      orderId
    }

    // Send notification to each subscribed device using web push (dynamic require for runtime)
    let sentCount = 0
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const webPush = require('web-push')
      const { setVapidDetails, sendNotification } = webPush
      
      const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
      const vapidEmail = process.env.VAPID_EMAIL || 'admin@restaurant.com'

      if (!vapidPublicKey || !vapidPrivateKey) {
        console.warn('[KOT Notification] VAPID keys not configured, skipping push')
      } else {
        setVapidDetails(
          `mailto:${vapidEmail}`,
          vapidPublicKey,
          vapidPrivateKey
        )

        for (const sub of subscriptions) {
          try {
            await sendNotification(
              sub.subscription,
              JSON.stringify(notificationPayload)
            )
            sentCount++
          } catch (err: any) {
            console.error(`[KOT Notification] Failed to send to ${sub.email}:`, err.message)
            // If subscription is invalid, remove it
            if (err.statusCode === 410 || err.statusCode === 404) {
              await db.collection('push_subscriptions').deleteOne({ _id: sub._id })
            }
          }
        }
      }
    } catch (webPushError) {
      console.warn('[KOT Notification] web-push package not available, falling back to in-app only:', (webPushError as Error).message)
    }

    // Also create notification records in the database for in-app notifications
    await db.collection('notifications').insertOne({
      restaurantId: session.restaurantId,
      type: 'new_kot',
      title: notificationPayload.title,
      body: notificationPayload.body,
      orderId,
      tableNumber: tableNumber || null,
      items: items || [],
      read: false,
      createdAt: new Date(),
      forRole: 'chef'
    })

    return NextResponse.json({ 
      message: `Notification sent to ${sentCount} chef device(s)`,
      subscribersFound: subscriptions.length,
      sentCount
    })
  } catch (error) {
    console.error('[KOT Notification] Error:', error)
    return NextResponse.json({ message: 'Failed to send notification' }, { status: 500 })
  }
}

// GET: Get unread notifications for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const notifications = await db.collection('notifications')
      .find({ 
        restaurantId: session.restaurantId,
        forRole: (session as any).role || 'chef',
        read: false
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('[Notifications] GET error:', error)
    return NextResponse.json({ notifications: [] })
  }
}

// PATCH: Mark notifications as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { notificationIds } = await req.json()

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    await db.collection('notifications').updateMany(
      { 
        _id: { $in: notificationIds.map((id: string) => id as any) },
        restaurantId: session.restaurantId
      },
      { $set: { read: true } }
    )

    return NextResponse.json({ message: 'Notifications marked as read' })
  } catch (error) {
    console.error('[Notifications] PATCH error:', error)
    return NextResponse.json({ message: 'Failed to update notifications' }, { status: 500 })
  }
}