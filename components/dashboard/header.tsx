'use client'

import { useOfflineMode } from '@/hooks/use-offline-mode'
import { StatusIndicator } from '@/components/status-indicator'

interface DashboardHeaderProps {
  user: any
  onMenuToggle: () => void
}

export default function DashboardHeader({ user, onMenuToggle }: DashboardHeaderProps) {
  const offlineMode = useOfflineMode()

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 card-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <StatusIndicator
            isOnline={offlineMode.isOnline}
            isManualOffline={offlineMode.isManualOffline}
            isDatabaseConnected={offlineMode.isDatabaseConnected}
            isSyncing={offlineMode.isSyncing}
            syncProgress={offlineMode.syncProgress}
            onToggleOfflineMode={offlineMode.setManualOfflineMode}
          />

          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
