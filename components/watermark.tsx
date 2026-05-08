'use client'

import { usePathname } from 'next/navigation'

export function Watermark() {
  const pathname = usePathname()
  
  // Don't show watermark on the landing page
  if (pathname === '/') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 text-xs text-gray-400 pointer-events-none font-light z-50">
      <p>Made by Shaurya</p>
    </div>
  )
}