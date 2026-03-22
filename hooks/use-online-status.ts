import { useEffect, useState } from 'react'
import { offlineSyncManager } from '@/lib/offline-sync'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Set initial status
    setIsOnline(offlineSyncManager.getStatus())

    // Subscribe to status changes
    const unsubscribe = offlineSyncManager.subscribe((status) => {
      setIsOnline(status)
    })

    return unsubscribe
  }, [])

  return isOnline
}
