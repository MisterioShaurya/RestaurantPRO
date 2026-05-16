import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getMongoClient } from '@/lib/mongodb'
import { subscriptionService } from '@/lib/subscription-service'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function generateRestaurantUsername(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30)
    || `restaurant-${Date.now()}`
}

export async function POST(req: NextRequest) {
  const { username, email, password, passwordConfirm, restaurantName, subscriptionType = 'MONTHLY' } = await req.json()

  try {
    if (!username || !email || !password || !passwordConfirm || !restaurantName) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    if (password !== passwordConfirm) {
      return NextResponse.json({ message: 'Passwords do not match' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const users = db.collection('users')

    const existingUser = await users.findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email or username already exists' }, { status: 400 })
    }

    const restaurantUsername = generateRestaurantUsername(restaurantName)
    const hashedPassword = await bcrypt.hash(password, 12)

    const userData = {
      username,
      email,
      password: hashedPassword,
      name: username,
      restaurantName,
      restaurantUsername,
      restaurantId: '',
      role: 'admin',
      isAdmin: true,
      isActive: true,
      isFirstLogin: true,
      tablesCount: 12,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await users.insertOne(userData)
    const userId = result.insertedId.toString()

    // Update with actual restaurantId
    await users.updateOne(
      { _id: result.insertedId },
      { $set: { restaurantId: userId } }
    )

    const subscription = await subscriptionService.createSubscription(
      userId,
      username,
      subscriptionType as 'MONTHLY' | 'YEARLY'
    )

    // Create default tables
    const defaultTables = []
    for (let i = 1; i <= 12; i++) {
      defaultTables.push({
        number: i, capacity: 4, status: 'available',
        tableName: `Table ${i}`, userId, restaurantId: userId,
        createdAt: new Date(), updatedAt: new Date()
      })
    }
    await db.collection('tables').insertMany(defaultTables)

    // Create default menu items
    await db.collection('menu').insertMany([
      { name: 'Samosa', price: 80, category: 'Appetizers', description: 'Crispy potato samosa', available: true, userId, restaurantId: userId, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Paneer Tikka', price: 150, category: 'Appetizers', description: 'Grilled paneer pieces', available: true, userId, restaurantId: userId, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Butter Chicken', price: 280, category: 'Main Course', description: 'Tender chicken in cream sauce', available: true, userId, restaurantId: userId, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Naan', price: 50, category: 'Breads', available: true, userId, restaurantId: userId, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Lassi', price: 60, category: 'Beverages', available: true, userId, restaurantId: userId, createdAt: new Date(), updatedAt: new Date() },
    ])

    const token = jwt.sign({
      userId,
      email,
      username,
      role: 'admin',
      restaurantName,
      restaurantUsername,
      restaurantId: userId,
      isAdmin: true
    }, JWT_SECRET, { expiresIn: '24h' })

    const response = NextResponse.json({
      message: 'Account created successfully',
      token,
      user: {
        id: userId, username, email, restaurantName, restaurantUsername,
        role: 'admin', isAdmin: true, isFirstLogin: true, tablesCount: 12
      },
      subscription: {
        type: subscription.subscription_type,
        expiryDate: subscription.subscription_expiry_date,
        status: subscription.status
      }
    })

    response.cookies.set('token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24
    })
    response.cookies.set('userRole', 'admin', {
      httpOnly: false, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24
    })

    return response

  } catch (error: any) {
    const errorMessage = error?.message || 'Failed to create account'
    console.error('Signup error:', error)
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}