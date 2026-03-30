import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getMongoClient } from '@/lib/mongodb'
import { subscriptionService } from '@/lib/subscription-service'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  try {
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const users = db.collection('users')

    // Find user by email
    const user = await users.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // Validate system date
    const dateValidation = await subscriptionService.validateSystemDate(user._id.toString())
    if (!dateValidation.isValid) {
      return NextResponse.json(
        { message: dateValidation.message },
        { status: 403 }
      )
    }

    // Check subscription status
    const subscriptionCheck = await subscriptionService.checkSubscription(user._id.toString())

    // Create JWT token with restaurantId
    const token = jwt.sign({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      restaurantName: user.restaurantName,
      restaurantId: user._id.toString(),
      isAdmin: user.isAdmin || false
    }, JWT_SECRET, { expiresIn: '24h' })

    // Update last login time
    await db.collection('subscriptions').updateOne(
      { business_id: user._id.toString() },
      { $set: { last_login_time: new Date() } }
    )

    const response = NextResponse.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        name: user.name,
        restaurantName: user.restaurantName,
        isAdmin: user.isAdmin || false,
        isFirstLogin: user.isFirstLogin || false,
        tablesCount: user.tablesCount || 0
      },
      subscription: subscriptionCheck
    })

    // Set token as cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    )
  }
}
