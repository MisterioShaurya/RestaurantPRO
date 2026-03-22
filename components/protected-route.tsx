import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: Array<'admin' | 'counter' | 'chef'>
}

export async function ProtectedRoute({ 
  children, 
  requiredRoles 
}: ProtectedRouteProps) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  if (requiredRoles && !requiredRoles.includes(session.role)) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
