import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import { getMongoClient } from '@/lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    const client = await getMongoClient()
    const db = client.db('restaurant_pro')
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: { id: user._id, name: user.name, email: user.email } })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
}
