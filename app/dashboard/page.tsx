'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SideNav from '@/components/dashboard/sidenav'
import DashboardHeader from '@/components/dashboard/header'
import DashboardHome from '@/components/dashboard/home'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const hasCheckedAuth = useRef(false)

  useEffect(() => {
    // Prevent multiple auth checks
    if (hasCheckedAuth.current) return

    const checkAuth = async () => {
      hasCheckedAuth.current = true

      try {
        // Check if user is authenticated via JWT token
        const token = localStorage.getItem('token')
        if (!token) {
          console.log('[Dashboard] No token found, redirecting to login')
          router.push('/login')
          return
        }

        // Verify token with server
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          console.log('[Dashboard] Token invalid, redirecting to login')
          localStorage.removeItem('token')
          router.push('/login')
          return
        }

        const userData = await response.json()
        setUser(userData.user)

      } catch (error) {
        console.error('[Dashboard] Auth check error:', error)
        localStorage.removeItem('token')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-color-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-color-primary mx-auto mb-4"></div>
          <p className="text-color-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-color-background overflow-hidden">
      <SideNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <DashboardHome user={user} />
        </main>
      </div>
    </div>
  )
}
