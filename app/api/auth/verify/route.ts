import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import { getMongoClient } from '@/lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      username: string
      restaurantName: string
      restaurantId: string
    }

    // Get user from database
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const user = await db.collection('users').findOne({
      _id: new ObjectId(decoded.userId),
      isActive: true
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found or inactive' }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        name: user.name,
        restaurantName: user.restaurantName,
        restaurantId: user._id.toString()
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }
}
