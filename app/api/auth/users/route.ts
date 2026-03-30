import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const users = db.collection('users')

    // Find all users with this email (should be one, but get the admin first if exists)
    const usersList = await users
      .find({ email })
      .toArray()

    if (usersList.length === 0) {
      return NextResponse.json({ error: 'No users found with this email' }, { status: 404 })
    }

    // Return users list without passwords
    const normalized = usersList.map(u => ({
      _id: u._id?.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
    }))

    return NextResponse.json({ users: normalized })
  } catch (error) {
    console.error('Get users by email error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
