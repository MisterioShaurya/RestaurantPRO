'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X, Menu, ChefHat, LogOut } from 'lucide-react'

interface DrawerProps {
  userRole?: string
  isChef?: boolean
  onLogout?: () => void
}

interface NavItem {
  href: string
  label: string
  icon: string
}

const navItems: Record<string, NavItem[]> = {
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/tables', label: 'POS / Tables', icon: '🍽️' },
    { href: '/dashboard/menu', label: 'Menu Items', icon: '📋' },
    { href: '/dashboard/orders', label: 'Orders', icon: '📄' },
    { href: '/dashboard/kitchen', label: 'KOT / Kitchen', icon: '👨‍🍳' },
    { href: '/dashboard/order-logs', label: 'KOT Logs', icon: '📜' },
    { href: '/dashboard/inventory', label: 'Inventory', icon: '📦' },
    { href: '/dashboard/staff', label: 'Staff', icon: '👥' },
    { href: '/dashboard/payroll', label: 'Payroll', icon: '💰' },
    { href: '/dashboard/expenses', label: 'Expenses', icon: '💸' },
    { href: '/dashboard/reservations', label: 'Reservations', icon: '📅' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
    { href: '/dashboard/billing', label: 'Billing', icon: '🧾' },
    { href: '/dashboard/bill-logs', label: 'Bill Logs', icon: '📑' },
    { href: '/dashboard/role-management', label: 'Role Mgmt', icon: '⚙️' },
    { href: '/dashboard/integrations', label: 'Integrations', icon: '🔌' },
    { href: '/dashboard/contact', label: 'Contact', icon: '📧' },
  ],
  cashier: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/tables', label: 'POS / Tables', icon: '🍽️' },
    { href: '/dashboard/order-logs', label: 'KOT Logs', icon: '📜' },
    { href: '/dashboard/expenses', label: 'Expenses', icon: '💸' },
    { href: '/dashboard/reservations', label: 'Reservations', icon: '📅' },
    { href: '/dashboard/billing', label: 'Billing', icon: '🧾' },
  ],
  chef: [
    { href: '/dashboard/kitchen', label: 'KOT Orders', icon: '👨‍🍳' },
    { href: '/dashboard/order-logs', label: 'KOT Logs', icon: '📜' },
  ],
}

export default function MobileDrawer({ userRole = 'admin', isChef = false, onLogout }: DrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const items = isChef ? navItems.chef : (navItems[userRole] || navItems.admin)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 hover:bg-gray-100 transition"
        aria-label="Open menu"
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <Menu size={24} className="text-gray-700" />
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <ChefHat size={24} className="text-orange-500" />
            <span className="font-bold text-lg text-gray-900">Restaurant</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            style={{ minWidth: 44, minHeight: 44 }}
            aria-label="Close menu"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href)
                  setIsOpen(false)
                }}
                style={{ minHeight: 44 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                  isActive
                    ? 'bg-orange-100 text-orange-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {isChef && onLogout && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => { onLogout(); setIsOpen(false) }}
              style={{ minHeight: 44 }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition font-semibold"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}