import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

interface UserSession {
  userId: string
  email: string
  role: 'admin' | 'counter' | 'chef'
  restaurantName: string
}

export function useUser() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      if (token) {
        const decoded = jwtDecode<UserSession>(token)
        
        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          setUser(null)
        } else {
          setUser(decoded)
        }
      }
    } catch (error) {
      console.error('Failed to decode user token:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { user, loading }
}

export function useRole() {
  const [role, setRole] = useState<'admin' | 'counter' | 'chef' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const roleFromCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userRole='))
        ?.split('=')[1] as 'admin' | 'counter' | 'chef' | null

      setRole(roleFromCookie || null)
    } catch (error) {
      console.error('Failed to get user role:', error)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { role, loading }
}

export function useIsAdmin() {
  const { role } = useRole()
  return role === 'admin'
}

export function useIsChef() {
  const { role } = useRole()
  return role === 'chef'
}

export function useIsCounter() {
  const { role } = useRole()
  return role === 'counter'
}

export function useHasRole(requiredRoles: Array<'admin' | 'counter' | 'chef'>) {
  const { role } = useRole()
  return role ? requiredRoles.includes(role) : false
}
