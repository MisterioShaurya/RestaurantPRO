import { NextRequest } from 'next/server'
import { getMongoClient } from './mongodb'

/**
 * Extract restaurantId from request
 * This ensures all API calls are scoped to the correct restaurant
 */
export async function getRestaurantIdFromRequest(req: NextRequest): Promise<string | null> {
  try {
    // Try to get from Authorization header (JWT)
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const jwt = require('jsonwebtoken')
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        if (decoded.restaurantId) {
          return decoded.restaurantId
        }
        // If no restaurantId in token, get it from user
        if (decoded.id || decoded.email) {
        const client = await getMongoClient()
        const db = client.db('restaurant_pos')
        const user = await db.collection('users').findOne({
          $or: [
            { _id: decoded.id as any },
            { email: decoded.email }
          ]
        })
          if (user?.restaurantId) {
            return user.restaurantId.toString()
          }
        }
      } catch (jwtError) {
        console.error('[Auth] JWT verification error:', jwtError)
      }
    }

    // Try to get from cookie
    const cookieHeader = req.headers.get('cookie')
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {} as Record<string, string>)

      // Try to get from token cookie (JWT)
      if (cookies.token) {
        const jwt = require('jsonwebtoken')
        try {
          const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET!) as any
          if (decoded.restaurantId) {
            return decoded.restaurantId
          }
        } catch (jwtError) {
          console.error('[Auth] JWT verification error from cookie:', jwtError)
        }
      }

      // Try to get from userId cookie
      if (cookies.userId) {
        const client = await getMongoClient()
        const db = client.db('restaurant_pos')
        const user = await db.collection('users').findOne({ _id: cookies.userId as any })
        if (user?.restaurantId) {
          return user.restaurantId.toString()
        }
      }
    }

    // Try to get from custom header
    const restaurantIdHeader = req.headers.get('x-restaurant-id')
    if (restaurantIdHeader) {
      return restaurantIdHeader
    }

    return null
  } catch (error) {
    console.error('[Auth] Error getting restaurantId:', error)
    return null
  }
}

/**
 * Get restaurantId from user ID
 */
export async function getRestaurantIdFromUserId(userId: string): Promise<string | null> {
  try {
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    const user = await db.collection('users').findOne({ _id: userId as any })
    return user?.restaurantId?.toString() || null
  } catch (error) {
    console.error('[Auth] Error getting restaurantId from userId:', error)
    return null
  }
}

/**
 * Ensure restaurantId exists for a user
 * If not, create one
 */
export async function ensureRestaurantId(userId: string): Promise<string> {
  try {
    const client = await getMongoClient()
    const db = client.db('restaurant_pos')
    
    const user = await db.collection('users').findOne({ _id: userId as any })
    
    if (user?.restaurantId) {
      return user.restaurantId.toString()
    }

    // Create a new restaurantId for this user
    const restaurantId = `rest-${userId}-${Date.now()}`
    
    await db.collection('users').updateOne(
      { _id: userId as any },
      { $set: { restaurantId } }
    )

    return restaurantId
  } catch (error) {
    console.error('[Auth] Error ensuring restaurantId:', error)
    throw new Error('Failed to get or create restaurantId')
  }
}