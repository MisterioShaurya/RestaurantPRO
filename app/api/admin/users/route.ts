import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { getServerSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    
    // Get all users with their subscription info
    const users = await db.collection('users').aggregate([
      {
        $lookup: {
          from: 'subscriptions',
          localField: '_id',
          foreignField: 'business_id',
          as: 'subscription'
        }
      },
      {
        $addFields: {
          subscription: { $arrayElemAt: ['$subscription', 0] }
        }
      },
      {
        $project: {
          password: 0
        }
      }
    ]).toArray()

    return NextResponse.json({ users })
  } catch (error) {
    console.error('[Admin] Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { userId, updates } = await req.json()
    
    if (!userId || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    // Update user
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10)
    }

    await db.collection('users').updateOne(
      { _id: userId as any },
      { $set: updates }
    )

    // Update subscription if provided
    if (updates.subscription) {
      await db.collection('subscriptions').updateOne(
        { business_id: userId },
        { $set: updates.subscription }
      )
    }

    return NextResponse.json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('[Admin] Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { userId } = await req.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    // Deactivate user instead of deleting
    await db.collection('users').updateOne(
      { _id: userId as any },
      { $set: { isActive: false } }
    )

    return NextResponse.json({ message: 'User deactivated successfully' })
  } catch (error) {
    console.error('[Admin] Error deactivating user:', error)
    return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 })
  }
}