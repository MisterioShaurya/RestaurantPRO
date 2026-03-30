import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Secure admin credentials (hashed)
// Default: username: 'admin', password: 'RestaurantPRO@2026!'
const ADMIN_CREDENTIALS = {
  usernameHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // SHA-256 of 'admin'
  passwordHash: 'd591e641064c1ef1429742ba23d6d3f70d8489a3d391a3ceb69f6a8959d019e9', // SHA-256 of 'RestaurantPRO@2026!'
}

// Generate secure token
function generateSecureToken(): string {
  return crypto.randomBytes(64).toString('hex')
} 

// Hash function
function hashString(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Hash the provided credentials
    const usernameHash = hashString(username)
    const passwordHash = hashString(password)

    // Verify credentials
    if (usernameHash !== ADMIN_CREDENTIALS.usernameHash || 
        passwordHash !== ADMIN_CREDENTIALS.passwordHash) {
      // Log failed attempt
      console.warn(`[SECURITY] Failed admin login attempt from ${req.headers.get('x-forwarded-for') || 'unknown'} at ${new Date().toISOString()}`)
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate secure session token
    const token = generateSecureToken()
    
    // Log successful login
    console.log(`[SECURITY] Successful admin login from ${req.headers.get('x-forwarded-for') || 'unknown'} at ${new Date().toISOString()}`)

    // Create response with secure cookie
    const response = NextResponse.json({
      success: true,
      token,
      message: 'Authentication successful'
    })

    // Set secure HTTP-only cookie
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 4, // 4 hours
      path: '/'
    })

    return response
  } catch (error) {
    console.error('[Admin Auth] Error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Verify token endpoint
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('adminToken')?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // In production, verify token against database/cache
    // For now, just check if token exists and has proper length
    if (token.length === 128) {
      return NextResponse.json({ authenticated: true })
    }

    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}

// Logout endpoint
export async function DELETE(req: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear the admin token cookie
    response.cookies.set('adminToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('[Admin Auth] Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}