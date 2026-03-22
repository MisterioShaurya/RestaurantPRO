import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode'

export interface DecodedToken {
  userId: string
  email: string
  role: 'admin' | 'counter' | 'chef'
  restaurantName: string
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

export function requireRole(...allowedRoles: Array<'admin' | 'counter' | 'chef'>) {
  return async function middleware() {
    const session = await getServerSession()
    
    if (!session || !allowedRoles.includes(session.role)) {
      throw new Error('Unauthorized')
    }

    return session
  }
}
