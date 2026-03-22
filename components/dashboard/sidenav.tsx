'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { persistentUserStorage } from '@/lib/persistent-user-storage'
import { LogOut } from 'lucide-react'

interface SideNavProps {
  isOpen: boolean
  onToggle: () => void
}

export default function SideNav({ isOpen, onToggle }: SideNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    const currentUser = persistentUserStorage.getCurrentUser()
    if (currentUser) {
      setUserRole(currentUser.role)
      setUserName(currentUser.name)
    }
  }, [])

  // Admin menu
  const adminMenu = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊', color: 'blue' },
    { label: 'Tables', href: '/dashboard/tables', icon: '🍽️', color: 'orange' },
    { label: 'Menu Items', href: '/dashboard/menu', icon: '📜', color: 'amber' },
    { label: 'Orders', href: '/dashboard/orders', icon: '📋', color: 'cyan' },
    { label: 'Inventory', href: '/dashboard/inventory', icon: '📦', color: 'pink' },
    { label: 'Staff', href: '/dashboard/staff', icon: '👥', color: 'indigo' },
    { label: 'Reservations', href: '/dashboard/reservations', icon: '📅', color: 'rose' },
    { label: 'KOT Logs', href: '/dashboard/order-logs', icon: '🧾', color: 'teal' },
    { label: 'Analytics', href: '/dashboard/analytics', icon: '📈', color: 'lime' },
    { label: 'User Management', href: '/dashboard/users', icon: '👤', color: 'indigo' },
    { label: 'Integrations', href: '/dashboard/integrations', icon: '🔌', color: 'purple' },
    { label: 'Contact Us', href: '/dashboard/contact', icon: '📞', color: 'blue' },
  ]

  // Counter/Waiter menu
  const counterMenu = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊', color: 'blue' },
    { label: 'Tables', href: '/dashboard/tables', icon: '🍽️', color: 'orange' },
    { label: 'Menu Items', href: '/dashboard/menu', icon: '📜', color: 'amber' },
    { label: 'Orders', href: '/dashboard/orders', icon: '📋', color: 'cyan' },
    { label: 'Reservations', href: '/dashboard/reservations', icon: '📅', color: 'rose' },
    { label: 'Analytics', href: '/dashboard/analytics', icon: '📈', color: 'lime' },
    { label: 'Contact Us', href: '/dashboard/contact', icon: '📞', color: 'blue' },
  ]

  // Chef menu
  const chefMenu = [
    { label: 'Orders', href: '/dashboard/orders', icon: '📋', color: 'cyan' },
    { label: 'KOT Logs', href: '/dashboard/order-logs', icon: '🧾', color: 'teal' },
  ]

  const getMenuItems = () => {
    if (userRole === 'chef') return chefMenu
    if (userRole === 'waiter' || userRole === 'manager') return counterMenu
    return adminMenu
  }

  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap: Record<string, { bg: string }> = {
      blue: { bg: 'bg-blue-500' },
      emerald: { bg: 'bg-emerald-500' },
      purple: { bg: 'bg-purple-500' },
      orange: { bg: 'bg-orange-500' },
      amber: { bg: 'bg-amber-500' },
      cyan: { bg: 'bg-cyan-500' },
      red: { bg: 'bg-red-500' },
      pink: { bg: 'bg-pink-500' },
      indigo: { bg: 'bg-indigo-500' },
      rose: { bg: 'bg-rose-500' },
      lime: { bg: 'bg-lime-500' },
      teal: { bg: 'bg-teal-500' },
      slate: { bg: 'bg-slate-500' },
    }

    const scheme = colorMap[color] || colorMap.blue
    if (isActive) {
      return `${scheme.bg} text-white shadow-lg`
    }
    return `text-gray-700 hover:bg-gray-100 transition-colors`
  }

  const handleLogout = () => {
    persistentUserStorage.logout()
    router.push('/login')
  }

  const menuItems = getMenuItems()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden z-20"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-72 bg-gradient-to-b from-white to-gray-50
          border-r-2 border-gray-200
          transform transition-transform duration-300 md:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col card-shadow
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b-2 border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">🍽️</span>
            </div>
            <div>
              <span className="text-lg font-bold text-white block">RestaurantPRO</span>
              <span className="text-xs text-white/90 font-medium">TEAM SHAURYA | NEXUS</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item: any) => {
            const isActive = pathname === item.href
            const isDisabled = item.disabled

            return (
              <Link
                key={item.href}
                href={isDisabled ? '#' : item.href}
                onClick={(e) => {
                  if (isDisabled) e.preventDefault()
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200
                  ${isDisabled ? 'bg-purple-50 text-purple-700 cursor-not-allowed hover:bg-purple-100' : getColorClasses(item.color, isActive)}
                  ${isActive && !isDisabled ? 'translate-x-1' : ''}
                `}
              >
                <span className="text-2xl shrink-0">{item.icon}</span>
                <span className="text-sm flex-1 truncate">{item.label}</span>
                {item.badge && <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">{item.badge}</span>}
                {isActive && !isDisabled && <span className="text-lg">→</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white space-y-3">
          <div className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-slate-600">Logged in as</p>
            <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
            <p className="text-xs text-slate-500 capitalize">{userRole || 'User'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 active:scale-95 text-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
