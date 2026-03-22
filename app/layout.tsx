import type { Metadata } from 'next'
import './globals.css'

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
    generator: 'v0.app'
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
      <body className="font-sans">{children}</body>
    </html>
  )
}
