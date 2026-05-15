import type { Metadata } from 'next'
import './globals.css'
import { Watermark } from '@/components/watermark'
import { PushNotificationManager } from '@/components/push-notification-manager'

// Use system fonts instead of Google Fonts for offline compatibility
const geistSans = {
  variable: '--font-geist-sans',
  className: 'font-sans'
}
const geistMono = {
  variable: '--font-geist-mono',
  className: 'font-mono'
}

export const metadata: Metadata = {
  title: 'RestaurantPro - Management System',
  description: 'Professional restaurant management system with POS, inventory, and analytics',
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0e27',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RestaurantPRO" />
      </head>
      <body className="font-sans">
        {children}
        <PushNotificationManager />
        {/* Watermark component handles showing/hiding based on route internally */}
      </body>
    </html>
  )
}
