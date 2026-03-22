import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getMongoClient } from '@/lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(req: NextRequest) {
  const { name, email, password, restaurantName } = await req.json()

  try {
    const client = await getMongoClient()
    const db = client.db('restaurant_pro')
    const users = db.collection('users')

    const existing = await users.findOne({ email })
    if (existing) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      restaurantName,
      role: 'admin',
      createdAt: new Date(),
    })

    const token = jwt.sign({ userId: user.insertedId, email }, JWT_SECRET)
    const response = NextResponse.json(
      { message: 'User created', userId: user.insertedId },
      { status: 201 }
    )
    response.cookies.set('token', token, { httpOnly: true, path: '/' })
    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Signup failed' },
      { status: 500 }
    )
  }
}
