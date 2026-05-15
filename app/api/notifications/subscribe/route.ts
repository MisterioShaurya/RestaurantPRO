import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getServerSession } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// POST: Subscribe to push notifications
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { subscription } = await req.json()
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ message: 'Invalid subscription' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    // Save or update subscription
    await db.collection('push_subscriptions').updateOne(
      { 
        userId: session.userId,
        endpoint: subscription.endpoint 
      },
      {
        $set: {
          userId: session.userId,
          email: session.email,
          role: (session as any).role || 'admin',
          restaurantId: session.restaurantId,
          subscription,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ message: 'Subscribed successfully' })
  } catch (error) {
    console.error('[Notifications] Subscribe error:', error)
    return NextResponse.json({ message: 'Failed to subscribe' }, { status: 500 })
  }
}

// DELETE: Unsubscribe from push notifications
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { endpoint } = await req.json()

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    await db.collection('push_subscriptions').deleteOne({
      userId: session.userId,
      endpoint
    })

    return NextResponse.json({ message: 'Unsubscribed successfully' })
  } catch (error) {
    console.error('[Notifications] Unsubscribe error:', error)
    return NextResponse.json({ message: 'Failed to unsubscribe' }, { status: 500 })
  }
}

// GET: List all subscriptions (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session || !session.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const subscriptions = await db.collection('push_subscriptions')
      .find({ restaurantId: session.restaurantId })
      .project({ subscription: 1, userId: 1, email: 1, role: 1, updatedAt: 1 })
      .toArray()

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error('[Notifications] GET error:', error)
    return NextResponse.json({ message: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}