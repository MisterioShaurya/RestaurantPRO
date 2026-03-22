import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getMongoClient } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: NextRequest) {
  const { email, password, userId } = await req.json()

  try {
    const client = await getMongoClient()
    const db = client.db('restaurant_pro')
    const users = db.collection('users')

    let user

    // If userId is provided (selecting from list), verify password for that user
    if (userId) {
      user = await users.findOne({ _id: new ObjectId(userId) })
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return NextResponse.json(
          { message: 'Invalid password' },
          { status: 401 }
        )
      }
    } else {
      // Traditional email/password login (for admin first login)
      user = await users.findOne({ email })
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        )
      }
    }

    const token = jwt.sign({ 
      userId: user._id, 
      email: user.email,
      role: user.role,
      restaurantName: user.restaurantName 
    }, JWT_SECRET)
    
    const response = NextResponse.json({ 
      message: 'Logged in', 
      user: { 
        id: user._id?.toString(), 
        name: user.name, 
        email: user.email,
        role: user.role
      } 
    })
    response.cookies.set('token', token, { httpOnly: true, path: '/', maxAge: 86400 })
    response.cookies.set('userId', user._id?.toString(), { httpOnly: false, path: '/', maxAge: 86400 })
    response.cookies.set('userRole', user.role, { httpOnly: false, path: '/', maxAge: 86400 })
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    )
  }
}
