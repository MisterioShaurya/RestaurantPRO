'use client'

import { useEffect, useState } from 'react'

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

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

    try {
      const registration = await navigator.serviceWorker.ready

      // Get VAPID public key from server
      const keyResponse = await fetch('/api/notifications/vapid-public-key')
      const keyData = await keyResponse.json()
      const vapidPublicKey = keyData.publicKey

      if (!vapidPublicKey) {
        console.warn('[PushNotification] No VAPID key configured, using fallback')
        alert('Push notifications require server configuration. Contact administrator.')
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
      }
    } catch (error) {
      console.error('[PushNotification] Error subscribing:', error)
      // Fallback: still mark as subscribed locally
      setIsSubscribed(true)
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

  // Auto-subscribe for chef users
  useEffect(() => {
    if (isSupported && userRole === 'chef' && !isSubscribed && !isLoading) {
      const timer = setTimeout(() => {
        subscribe()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isSupported, userRole, isSubscribed, isLoading])

  if (!isSupported || userRole !== 'chef') {
    return null
  }

  return null // Invisible component - handles notifications silently
}