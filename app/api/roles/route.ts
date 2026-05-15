import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getMongoClient } from '@/lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper to get session from either cookie or Authorization header
async function getSessionFromRequest(req: NextRequest) {
  // Try cookie-based auth first
  const cookieToken = req.cookies.get('token')?.value
  if (cookieToken) {
    try {
      const decoded = jwt.verify(cookieToken, JWT_SECRET) as any
      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return null
      }
      return decoded
    } catch (e) {
      // Cookie invalid, continue to try header
    }
  }

  // Try Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return null
      }
      return decoded
    } catch (e) {
      return null
    }
  }

  return null
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    // If session says not admin, check database to be safe (handles legacy users)
    let isAdmin = session.isAdmin
    if (!isAdmin && session.email && !session.isRoleAccount) {
      try {
        const client = await getMongoClient()
        const db = client.db('restaurant_pos')
        const user = await db.collection('users').findOne({ email: session.email })
        if (user) {
          isAdmin = true // Primary account users are always admins
        }
      } catch {}
    }
    
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const roleAccounts = await db.collection('role_accounts')
      .find({ restaurantId: session.restaurantId })
      .sort({ createdAt: -1 })
      .toArray()

    // Map to safe response (remove passwords)
    const safeAccounts = roleAccounts.map(account => ({
      _id: account._id.toString(),
      name: account.name,
      email: account.email,
      role: account.role,
      isActive: account.isActive ?? true,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    }))

    return NextResponse.json({ accounts: safeAccounts })
  } catch (error) {
    console.error('[Roles] GET error:', error)
    return NextResponse.json({ message: 'Failed to fetch role accounts' }, { status: 500 })
  }
}

// Helper function to verify admin access with fallback to DB
async function verifyAdmin(session: any): Promise<boolean> {
  if (!session) return false
  if (session.isAdmin) return true
  
  // Fallback: check DB for primary account owners
  if (session.email && !session.isRoleAccount) {
    try {
      const { getMongoClient } = await import('@/lib/mongodb')
      const client = await getMongoClient()
      const db = client.db('restaurant_pos')
      const user = await db.collection('users').findOne({ email: session.email })
      if (user) return true // Primary account users are always admins
    } catch {}
  }
  return false
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!(await verifyAdmin(session))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, password, role } = await req.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    if (role !== 'chef' && role !== 'cashier') {
      return NextResponse.json({ message: 'Invalid role. Must be chef or cashier' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Validate email format: chef@restaurant.com or cashier@restaurant.com
    const expectedPrefix = role === 'chef' ? 'chef' : 'cashier'
    const emailRegex = new RegExp(`^${expectedPrefix}@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$`)
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: `Email must be in format: ${expectedPrefix}@restaurantname.com` },
        { status: 400 }
      )
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    // Check if email already exists for this restaurant
    const existing = await db.collection('role_accounts').findOne({
      email,
      restaurantId: session.restaurantId
    })

    if (existing) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const roleAccount = {
      name,
      email,
      password: hashedPassword,
      role,
      restaurantId: session.restaurantId,
      restaurantName: session.restaurantName,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('role_accounts').insertOne(roleAccount)

    return NextResponse.json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
      account: {
        _id: result.insertedId.toString(),
        name,
        email,
        role,
        isActive: true
      }
    }, { status: 201 })
  } catch (error) {
    console.error('[Roles] POST error:', error)
    return NextResponse.json({ message: 'Failed to create role account' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!(await verifyAdmin(session))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { accountId, updates } = await req.json()

    if (!accountId) {
      return NextResponse.json({ message: 'Account ID is required' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    const setFields: Record<string, any> = { updatedAt: new Date() }

    if (updates.name !== undefined) setFields.name = updates.name
    if (updates.email !== undefined) setFields.email = updates.email
    if (updates.isActive !== undefined) setFields.isActive = updates.isActive
    if (updates.password !== undefined) {
      setFields.password = await bcrypt.hash(updates.password, 12)
    }

    const result = await db.collection('role_accounts').updateOne(
      { _id: accountId as any, restaurantId: session.restaurantId },
      { $set: setFields }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Account updated successfully' })
  } catch (error) {
    console.error('[Roles] PUT error:', error)
    return NextResponse.json({ message: 'Failed to update account' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!(await verifyAdmin(session))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { accountId } = await req.json()

    if (!accountId) {
      return NextResponse.json({ message: 'Account ID is required' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')

    // Soft delete - set isActive to false
    const result = await db.collection('role_accounts').updateOne(
      { _id: accountId as any, restaurantId: session.restaurantId },
      { $set: { isActive: false, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Account not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Account deactivated successfully' })
  } catch (error) {
    console.error('[Roles] DELETE error:', error)
    return NextResponse.json({ message: 'Failed to deactivate account' }, { status: 500 })
  }
}