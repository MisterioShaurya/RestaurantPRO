'use client'

import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            ⚙️ Settings
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Configure your RestaurantPro account</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition shadow-md"
        >
          ← Back
        </button>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Database Configuration */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            🗄️ Database Configuration
          </h2>
          <div className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300">Set your MongoDB URI in environment variables:</p>
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-4">
              <code className="text-sm text-emerald-600 dark:text-emerald-400 font-mono break-all">
                DATABASE_URL=your_mongodb_connection_string
              </code>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Example: <code className="text-emerald-600 dark:text-emerald-400">mongodb+srv://username:password@cluster.mongodb.net/restaurant_pro?retryWrites=true</code>
            </p>
          </div>
        </div>

        {/* Environment Setup */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            🔧 Environment Setup
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Required Variables:</p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> DATABASE_URL
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-slate-400">○</span> NODE_ENV (development/production)
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-300 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Create a <code className="text-slate-900 dark:text-white">.env.local</code> file in the project root
              </p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            ℹ️ System Information
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Application:</span>
              <span className="font-semibold text-slate-900 dark:text-white">RestaurantPro</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Version:</span>
              <span className="font-semibold text-slate-900 dark:text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Framework:</span>
              <span className="font-semibold text-slate-900 dark:text-white">Next.js 16</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Database:</span>
              <span className="font-semibold text-slate-900 dark:text-white">MongoDB</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            ✨ Features
          </h2>
          <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Table Management
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Kitchen Display System
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Order Management
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Billing & POS
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Inventory Tracking
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Staff Management
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Reservations
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> Analytics & Reports
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 shadow-lg text-white">
        <h2 className="text-2xl font-bold mb-2">Need Help?</h2>
        <p className="mb-4">For support or technical assistance, contact our team or check the documentation.</p>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-slate-100 transition">
            📖 Documentation
          </button>
          <button className="px-4 py-2 bg-indigo-600 border border-white hover:bg-indigo-700 text-white rounded-lg font-semibold transition">
            💬 Support Chat
          </button>
        </div>
      </div>
    </div>
  )
}
