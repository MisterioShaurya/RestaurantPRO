'use client'

import { useState, useEffect, ReactNode } from 'react'
import { Monitor, Smartphone, AlertCircle } from 'lucide-react'

interface DesktopOnlyWrapperProps {
  children: ReactNode
}

export default function DesktopOnlyWrapper({ children }: DesktopOnlyWrapperProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword))
      
      // Also check screen width
      const isMobileScreen = window.innerWidth < 768
      
      setIsMobile(isMobileDevice || isMobileScreen)
    }

    checkDevice()
    
    // Listen for resize events
    const handleResize = () => {
      checkDevice()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return null
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10 text-center">
            <div className="inline-block p-4 bg-linear-to-br from-orange-500 to-red-500 rounded-xl mb-6">
              <Smartphone className="text-white" size={32} />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Desktop Required
            </h1>
            
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <AlertCircle size={20} className="text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700 text-left">
                This application is optimized for desktop and laptop computers. Please access it from a device with a larger screen for the best experience.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Monitor size={20} className="text-blue-600" />
                <span className="text-sm text-slate-700">Use a desktop or laptop computer</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Monitor size={20} className="text-blue-600" />
                <span className="text-sm text-slate-700">Screen width should be at least 768px</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Restaurant Management System - Enterprise POS Solution
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}