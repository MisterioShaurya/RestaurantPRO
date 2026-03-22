import { useEffect, useState, useCallback } from 'react'

interface OfflineModeState {
  isOnline: boolean
  isManualOffline: boolean
  isDatabaseConnected: boolean
  isSyncing: boolean
  syncProgress: number
}

export function useOfflineMode() {
  const [state, setState] = useState<OfflineModeState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isManualOffline: false,
    isDatabaseConnected: false,
    isSyncing: false,
    syncProgress: 0,
  })

  // Initialize from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('__OFFLINE_MODE__')
      if (saved) {
        const { isManualOffline } = JSON.parse(saved)
        setState((prev) => ({ ...prev, isManualOffline }))
      }
    } catch (err) {
      console.error('[OfflineMode] Failed to load state:', err)
    }
  }, [])

  // Listen to online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Determine effective offline mode
  const effectiveOfflineMode = state.isManualOffline || !state.isOnline
  const isEffectivelyOnline = state.isOnline && !state.isManualOffline

  // Save mode preference
  const setManualOfflineMode = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, isManualOffline: value }))
    try {
      localStorage.setItem(
        '__OFFLINE_MODE__',
        JSON.stringify({ isManualOffline: value })
      )
    } catch (err) {
      console.error('[OfflineMode] Failed to save state:', err)
    }
  }, [])

  // Update database connection status
  const setDatabaseConnected = useCallback((connected: boolean) => {
    setState((prev) => ({ ...prev, isDatabaseConnected: connected }))
  }, [])

  // Update sync status
  const setSyncing = useCallback((syncing: boolean, progress = 0) => {
    setState((prev) => ({ ...prev, isSyncing: syncing, syncProgress: progress }))
  }, [])

  return {
    ...state,
    effectiveOfflineMode,
    isEffectivelyOnline,
    setManualOfflineMode,
    setDatabaseConnected,
    setSyncing,
  }
}
