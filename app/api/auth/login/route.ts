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

    // First, check if this is a role-based login (chef@xxx.com or cashier@xxx.com)
    let role: string | null = null
    let restaurantUsername: string | null = null

    if (email.includes('@')) {
      const [localPart, domain] = email.split('@')
      if (domain) {
        const domainName = domain.split('.')[0] // Get "restaurantusername" from "restaurantusername.com"
        
        const chefMatch = localPart.match(/^chef$/)
        const cashierMatch = localPart.match(/^cashier$/)
        
        if (chefMatch) {
          role = 'chef'
          restaurantUsername = domainName
        } else if (cashierMatch) {
          role = 'cashier'
          restaurantUsername = domainName
        }
      }
    }

    if (role && restaurantUsername) {
      // Role-based login: find the admin user by restaurant username 
      // (username is unique, no need to check isAdmin since legacy users may have isAdmin: false)
      const adminUser = await db.collection('users').findOne({
        username: restaurantUsername
      })

      if (!adminUser) {
        return NextResponse.json(
          { message: 'Restaurant not found' },
          { status: 401 }
        )
      }

      // Find the role account in the role_accounts collection
      const roleAccount = await db.collection('role_accounts').findOne({
        email: email,
        restaurantId: adminUser._id.toString(),
        isActive: true
      })

      if (!roleAccount || !(await bcrypt.compare(password, roleAccount.password))) {
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Create JWT token for role user
      const token = jwt.sign({
        userId: roleAccount._id.toString(),
        email: roleAccount.email,
        username: roleAccount.name,
        role: roleAccount.role,
        restaurantName: adminUser.restaurantName,
        restaurantId: adminUser._id.toString(),
        isAdmin: false,
        isRoleAccount: true
      }, JWT_SECRET, { expiresIn: '24h' })

      const response = NextResponse.json({
        message: 'Logged in successfully',
        token,
        user: {
          id: roleAccount._id.toString(),
          username: roleAccount.name,
          email: roleAccount.email,
          name: roleAccount.name,
          restaurantName: adminUser.restaurantName,
          role: roleAccount.role,
          isAdmin: false,
          isRoleAccount: true,
          tablesCount: adminUser.tablesCount || 0
        }
      })

      // Set token as cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
      })
      
      // Set userRole cookie for client-side checks
      response.cookies.set('userRole', roleAccount.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24
      })

      return response
    }

    // Regular admin login flow
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

    // Create JWT token with restaurantId and restaurantUsername
    const token = jwt.sign({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: 'admin',
      restaurantName: user.restaurantName,
      restaurantUsername: user.restaurantUsername || user.username,
      restaurantId: user._id.toString(),
      isAdmin: true // Primary account owners are always admins
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
        role: 'admin',
        restaurantName: user.restaurantName,
        restaurantUsername: user.restaurantUsername || user.username,
        isAdmin: true, // Primary account owners are always admins
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
    
    response.cookies.set('userRole', 'admin', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
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