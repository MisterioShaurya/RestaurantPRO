'use client'

import React, { useState } from 'react'
import { Wifi, WifiOff, Database, AlertCircle, CheckCircle, Upload } from 'lucide-react'

interface StatusIndicatorProps {
  isOnline: boolean
  isManualOffline: boolean
  isDatabaseConnected: boolean
  isSyncing: boolean
  syncProgress: number
  onToggleOfflineMode: (value: boolean) => void
}

export function StatusIndicator({
  isOnline,
  isManualOffline,
  isDatabaseConnected,
  isSyncing,
  syncProgress,
  onToggleOfflineMode,
}: StatusIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false)

  const effectiveMode = isManualOffline || !isOnline ? 'offline' : 'online'
  const canToggle = isOnline // Only allow toggle when internet is available

  return (
    <div className="relative">
      {/* Status Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition ${
          effectiveMode === 'offline'
            ? 'bg-orange-100 text-orange-900 hover:bg-orange-200'
            : 'bg-green-100 text-green-900 hover:bg-green-200'
        }`}
        title={
          isManualOffline
            ? 'Manually set to Offline Mode'
            : isOnline
              ? 'Online Mode'
              : 'No Internet Connection'
        }
      >
        {effectiveMode === 'offline' ? (
          <>
            <WifiOff size={18} />
            <span className="text-sm">Offline Mode</span>
          </>
        ) : (
          <>
            <Wifi size={18} />
            <span className="text-sm">Online Mode</span>
          </>
        )}
      </button>

      {/* Details Dropdown */}
      {showDetails && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4 min-w-64 z-50">
          {/* Mode Section */}
          <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Mode
              </span>
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  effectiveMode === 'offline'
                    ? 'bg-orange-100 text-orange-900'
                    : 'bg-green-100 text-green-900'
                }`}
              >
                {effectiveMode.toUpperCase()}
              </span>
            </div>

            {/* Internet Status */}
            <div className="flex items-center gap-2 mb-2">
              {isOnline ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <AlertCircle size={16} className="text-red-600" />
              )}
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {isOnline ? 'Internet Connected' : 'No Internet Connection'}
              </span>
            </div>

            {/* Toggle Button */}
            {isOnline && (
              <button
                onClick={() => {
                  onToggleOfflineMode(!isManualOffline)
                  setShowDetails(false)
                }}
                className={`w-full mt-2 px-3 py-2 rounded border transition text-sm font-semibold ${
                  isManualOffline
                    ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                    : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                }`}
              >
                {isManualOffline ? 'Switch to Online Mode' : 'Switch to Offline Mode'}
              </button>
            )}
          </div>

          {/* Database Section */}
          <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Database size={16} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Database
              </span>
              <div className="ml-auto">
                {isDatabaseConnected ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <AlertCircle size={16} className="text-orange-600" />
                )}
              </div>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isDatabaseConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>

          {/* Sync Section */}
          {isSyncing && (
            <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Upload size={16} className="text-blue-600 animate-pulse" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Syncing Data
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition"
                  style={{ width: `${syncProgress}%` }}
                ></div>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {syncProgress}% uploaded
              </span>
            </div>
          )}

          {/* Info Text */}
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <p className="mb-1">
              • Operations saved locally when offline
            </p>
            <p className="mb-1">
              • Data syncs automatically when online
            </p>
            <p>
              • No data loss, fully offline capable
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
