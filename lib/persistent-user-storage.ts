/**
 * Persistent User Storage
 * Provides a consistent interface for storing and retrieving user session data
 * across localStorage, cookies, and in-memory state.
 */

interface StoredUser {
  id: string
  username: string
  email: string
  name: string
  role: string
  restaurantName: string
  restaurantId: string
  restaurantUsername?: string
  isAdmin: boolean
  isRoleAccount?: boolean
  tablesCount?: number
}

class PersistentUserStorage {
  private currentUser: StoredUser | null = null
  private listeners: Array<(user: StoredUser | null) => void> = []

  /**
   * Save user data after login
   */
  setCurrentUser(user: StoredUser): void {
    this.currentUser = user
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user))
      localStorage.setItem('user', JSON.stringify(user))
      // Also set a non-httpOnly cookie for client-side access
      document.cookie = `userRole=${user.role}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
      document.cookie = `userId=${user.id}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
    }
    this.notifyListeners()
  }

  /**
   * Get current user from memory or localStorage
   */
  getCurrentUser(): StoredUser | null {
    if (this.currentUser) return this.currentUser

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('currentUser')
        if (stored) {
          this.currentUser = JSON.parse(stored)
          return this.currentUser
        }
        // Fallback to 'user' key
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          // Ensure role field is set
          if (!parsed.role) {
            parsed.role = parsed.isAdmin ? 'admin' : 'user'
          }
          // Set restaurantId if not present
          if (!parsed.restaurantId) {
            parsed.restaurantId = parsed.id || parsed.userId || ''
          }
          this.currentUser = parsed
          localStorage.setItem('currentUser', JSON.stringify(parsed))
          return this.currentUser
        }
      } catch {
        return null
      }
    }
    return null
  }

  /**
   * Get the user's role
   */
  getUserRole(): string {
    const user = this.getCurrentUser()
    return user?.role || 'admin'
  }

  /**
   * Get the restaurantId
   */
  getRestaurantId(): string | null {
    const user = this.getCurrentUser()
    return user?.restaurantId || user?.id || null
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.isAdmin === true || user?.role === 'admin'
  }

  /**
   * Check if the system is locked (not subscribed)
   * Returns false by default since subscription checks happen server-side
   */
  isLocked(): boolean {
    return false
  }

  /**
   * Clear user data on logout
   */
  logout(): void {
    this.currentUser = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      document.cookie = 'userRole=; path=/; max-age=0; SameSite=Lax'
      document.cookie = 'userId=; path=/; max-age=0; SameSite=Lax'
    }
    this.notifyListeners()
  }

  /**
   * Subscribe to user changes
   */
  subscribe(listener: (user: StoredUser | null) => void): () => void {
    this.listeners.push(listener)
    // Immediately call with current state
    listener(this.currentUser)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.currentUser)
      } catch {
        // Ignore listener errors
      }
    }
  }
}

export const persistentUserStorage = new PersistentUserStorage()