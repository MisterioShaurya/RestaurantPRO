import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getMongoClient } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id')
    
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const users = db.collection('users')

    // Get all users created by this admin (or if admin, get all from their restaurant)
    const adminUser = await users.findOne({ _id: new ObjectId(adminId) })
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const allUsers = await users
      .find({ restaurantName: adminUser.restaurantName })
      .toArray()

    const normalized = allUsers.map(u => ({
      _id: u._id?.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      restaurantName: u.restaurantName,
    }))

    return NextResponse.json({ users: normalized })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-admin-id')
    const { name, email, password, role } = await request.json()

    if (!adminId || !name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate role
    if (!['admin', 'counter', 'chef'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const users = db.collection('users')

    // Verify admin exists
    const admin = await users.findOne({ _id: new ObjectId(adminId), role: 'admin' })
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin not found' }, { status: 401 })
    }

    // Check if user already exists
    const existing = await users.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      restaurantName: admin.restaurantName,
      createdBy: adminId,
      createdAt: new Date(),
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          _id: result.insertedId.toString(),
          name,
          email,
          role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
