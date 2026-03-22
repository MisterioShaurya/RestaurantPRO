'use client'

import { useRouter } from 'next/navigation'

export default function ContactPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900">📞 Contact Us</h1>
        </div>
        <p className="text-lg text-gray-600">Get in touch with our support team</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Contact Information */}
        <div className="bg-white rounded-2xl card-shadow p-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📍 Contact Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📧</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-gray-600">support@restaurantpro.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">📞</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Phone</p>
                <p className="text-gray-600">+1-800-RESTAURANT</p>
                <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">🌐</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Website</p>
                <p className="text-gray-600">www.restaurantpro.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">📍</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Address</p>
                <p className="text-gray-600">123 Restaurant Street<br />Food City, FC 12345</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-white rounded-2xl card-shadow p-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🕒 Support Hours</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
              <ul className="space-y-1 text-gray-600">
                <li>Monday - Friday: 9:00 AM - 6:00 PM EST</li>
                <li>Saturday: 10:00 AM - 4:00 PM EST</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Emergency Support</h3>
              <p className="text-gray-600 mb-2">For critical system issues:</p>
              <p className="text-red-600 font-semibold">+1-800-RESTAURANT (Emergency)</p>
              <p className="text-sm text-gray-500">24/7 availability for urgent issues</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl card-shadow p-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Quick Actions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => window.open('mailto:support@restaurantpro.com?subject=Technical Support')}
              className="p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left"
            >
              <div className="text-red-600 text-xl mb-2">🆘</div>
              <p className="font-semibold text-gray-900">Technical Support</p>
              <p className="text-sm text-gray-600">Report bugs or issues</p>
            </button>

            <button
              onClick={() => window.open('mailto:sales@restaurantpro.com?subject=Feature Request')}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
            >
              <div className="text-blue-600 text-xl mb-2">💡</div>
              <p className="font-semibold text-gray-900">Feature Request</p>
              <p className="text-sm text-gray-600">Suggest new features</p>
            </button>

            <button
              onClick={() => window.open('mailto:partnerships@restaurantpro.com?subject=Partnership Inquiry')}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
            >
              <div className="text-green-600 text-xl mb-2">🤝</div>
              <p className="font-semibold text-gray-900">Partnerships</p>
              <p className="text-sm text-gray-600">Integration partnerships</p>
            </button>

            <button
              onClick={() => window.open('mailto:feedback@restaurantpro.com?subject=General Feedback')}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
            >
              <div className="text-purple-600 text-xl mb-2">💬</div>
              <p className="font-semibold text-gray-900">General Feedback</p>
              <p className="text-sm text-gray-600">Share your thoughts</p>
            </button>

            <button
              onClick={() => window.open('mailto:billing@restaurantpro.com?subject=Billing Question')}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
            >
              <div className="text-orange-600 text-xl mb-2">💰</div>
              <p className="font-semibold text-gray-900">Billing</p>
              <p className="text-sm text-gray-600">Payment and billing questions</p>
            </button>

            <button
              onClick={() => window.open('mailto:training@restaurantpro.com?subject=Training Request')}
              className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-left"
            >
              <div className="text-indigo-600 text-xl mb-2">🎓</div>
              <p className="font-semibold text-gray-900">Training</p>
              <p className="text-sm text-gray-600">Request training sessions</p>
            </button>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-2xl card-shadow p-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🌐 Follow Us</h2>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.open('https://twitter.com/restaurantpro')}
              className="flex items-center gap-3 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span className="text-blue-600">🐦</span>
              <span className="font-semibold text-gray-900">Twitter</span>
            </button>

            <button
              onClick={() => window.open('https://linkedin.com/company/restaurantpro')}
              className="flex items-center gap-3 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span className="text-blue-600">💼</span>
              <span className="font-semibold text-gray-900">LinkedIn</span>
            </button>

            <button
              onClick={() => window.open('https://facebook.com/restaurantpro')}
              className="flex items-center gap-3 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span className="text-blue-600">📘</span>
              <span className="font-semibold text-gray-900">Facebook</span>
            </button>

            <button
              onClick={() => window.open('https://instagram.com/restaurantpro')}
              className="flex items-center gap-3 px-4 py-2 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
            >
              <span className="text-pink-600">📷</span>
              <span className="font-semibold text-gray-900">Instagram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}