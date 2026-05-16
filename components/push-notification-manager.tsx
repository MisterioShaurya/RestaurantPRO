'use client'

import { useEffect, useState } from 'react'

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window
    setIsSupported(supported)

    // Get user role
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserRole(user.role)
      } catch {}
    }

    if (supported) {
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('[PushNotification] Error checking subscription:', error)
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const subscribe = async () => {
    if (!isSupported) return
    setIsLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready

      // Get VAPID public key from server
      const keyResponse = await fetch('/api/notifications/vapid-public-key')
      const keyData = await keyResponse.json()
      const vapidPublicKey = keyData.publicKey

      if (!vapidPublicKey) {
        // VAPID keys not configured - fall back to in-app notification bell
        setError('Push not configured - using in-app notifications')
        setIsLoading(false)
        return
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      // Send subscription to server
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscription }),
      })

      if (response.ok) {
        setIsSubscribed(true)
        console.log('[PushNotification] Successfully subscribed to push notifications')
      }
    } catch (error: any) {
      console.error('[PushNotification] Error subscribing:', error)
      // If permission denied or not granted, handle silently
      if (Notification.permission === 'denied') {
        setError('Notifications blocked - please enable in browser settings')
      } else {
        // Graceful fallback
        setError('Using in-app notifications')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    if (!isSupported) return
    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Notify server
        const token = localStorage.getItem('token')
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        setIsSubscribed(false)
      }
    } catch (error) {
      console.error('[PushNotification] Error unsubscribing:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PushNotification] Service Worker registered:', registration.scope)
        })
        .catch((error) => {
          console.error('[PushNotification] Service Worker registration failed:', error)
        })
    }
  }, [])

  // Auto-subscribe for chef users - request permission and subscribe
  useEffect(() => {
    if (isSupported && userRole === 'chef' && !isSubscribed && !isLoading) {
      // On chef login: request notification permission
      const requestPermission = async () => {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission()
          if (permission === 'granted') {
            // Permission granted, subscribe after a short delay
            setTimeout(() => subscribe(), 2000)
          } else {
            setError('Notifications permission not granted')
          }
        } else if (Notification.permission === 'granted') {
          // Already granted, subscribe silently
          const timer = setTimeout(() => {
            subscribe()
          }, 3000)
          return () => clearTimeout(timer)
        }
      }

      const timer = setTimeout(requestPermission, 1000)
      return () => clearTimeout(timer)
    }
  }, [isSupported, userRole, isSubscribed, isLoading])

  // This component is invisible - it just handles subscription logic silently
  // and does NOT show the "server configuration" alert error
  return null
}