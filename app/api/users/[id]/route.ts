import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = request.headers.get('x-admin-id')
    const { name, email, password, role } = await request.json()

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const users = db.collection('users')

    // Verify admin
    const admin = await users.findOne({ _id: new ObjectId(adminId), role: 'admin' })
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prepare update object
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (password) updateData.password = await bcrypt.hash(password, 10)

    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(params.id), restaurantName: admin.restaurantName },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    if (!result.value) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'User updated',
      user: {
        _id: result.value._id?.toString(),
        name: result.value.name,
        email: result.value.email,
        role: result.value.role,
      },
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = request.headers.get('x-admin-id')

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const users = db.collection('users')

    // Verify admin
    const admin = await users.findOne({ _id: new ObjectId(adminId), role: 'admin' })
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await users.deleteOne({
      _id: new ObjectId(params.id),
      restaurantName: admin.restaurantName,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'User deleted' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
