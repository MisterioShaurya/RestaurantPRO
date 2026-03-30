import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode'

export interface DecodedToken {
  userId: string
  email: string
  username: string
  restaurantName: string
  restaurantId: string
  isAdmin: boolean
  iat: number
  exp: number
}

export async function getServerSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token)
    
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null
    }

    return decoded
  } catch (error) {
    return null
  }
}

export function getClientSession() {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1]

  if (!token) {
    return null
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token)
    
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null
    }

    return decoded
  } catch (error) {
    return null
  }
}

export function requireAdmin() {
  return async function middleware() {
    const session = await getServerSession()
    
    if (!session || !session.isAdmin) {
      throw new Error('Unauthorized - Admin access required')
    }

    return session
  }
}
