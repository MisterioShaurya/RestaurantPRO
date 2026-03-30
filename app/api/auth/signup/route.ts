import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getMongoClient } from '@/lib/mongodb'
import { subscriptionService } from '@/lib/subscription-service'

export async function POST(req: NextRequest) {
  const { username, email, password, passwordConfirm, restaurantName, subscriptionType = 'MONTHLY' } = await req.json()

  try {
    // Validate input
    if (!username || !email || !password || !passwordConfirm || !restaurantName) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate password confirmation
    if (password !== passwordConfirm) {
      return NextResponse.json(
        { message: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const users = db.collection('users')

    // Check if user already exists
    const existingUser = await users.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email or username already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const userData = {
      username,
      email,
      password: hashedPassword,
      name: username,
      restaurantName,
      isActive: true,
      isAdmin: false,
      isFirstLogin: true,
      tablesCount: 12,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await users.insertOne(userData)

    // Create subscription
    const subscription = await subscriptionService.createSubscription(
      result.insertedId.toString(),
      username,
      subscriptionType as 'MONTHLY' | 'YEARLY'
    )

    // Create default tables for the user
    const defaultTables = []
    for (let i = 1; i <= 12; i++) {
      defaultTables.push({
        number: i,
        capacity: 4,
        status: 'available',
        tableName: `Table ${i}`,
        userId: result.insertedId.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    await db.collection('tables').insertMany(defaultTables)

    // Create default menu items
    const defaultMenuItems = [
      { name: 'Samosa', price: 80, category: 'Appetizers', description: 'Crispy potato samosa', available: true, userId: result.insertedId.toString(), createdAt: new Date(), updatedAt: new Date() },
      { name: 'Paneer Tikka', price: 150, category: 'Appetizers', description: 'Grilled paneer pieces', available: true, userId: result.insertedId.toString(), createdAt: new Date(), updatedAt: new Date() },
      { name: 'Butter Chicken', price: 280, category: 'Main Course', description: 'Tender chicken in cream sauce', available: true, userId: result.insertedId.toString(), createdAt: new Date(), updatedAt: new Date() },
      { name: 'Naan', price: 50, category: 'Breads', available: true, userId: result.insertedId.toString(), createdAt: new Date(), updatedAt: new Date() },
      { name: 'Lassi', price: 60, category: 'Beverages', available: true, userId: result.insertedId.toString(), createdAt: new Date(), updatedAt: new Date() },
    ]

    await db.collection('menu').insertMany(defaultMenuItems)

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: result.insertedId.toString(),
        username,
        email,
        restaurantName
      },
      subscription: {
        type: subscription.subscription_type,
        expiryDate: subscription.subscription_expiry_date,
        status: subscription.status
      }
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create account'
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}
