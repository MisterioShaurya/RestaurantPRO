'use client'

import { useRouter } from 'next/navigation'

export default function IntegrationsPage() {
  const router = useRouter()

  const integrations = [
    {
      name: 'Payment Gateway',
      description: 'Integrate with Stripe, PayPal, or other payment processors',
      status: 'Coming Soon',
      icon: '💳',
      features: ['Secure payments', 'Multiple currencies', 'Transaction tracking']
    },
    {
      name: 'Delivery Services',
      description: 'Connect with Uber Eats, DoorDash, and local delivery partners',
      status: 'Coming Soon',
      icon: '🚚',
      features: ['Real-time orders', 'Driver tracking', 'Automated dispatch']
    },
    {
      name: 'Inventory Management',
      description: 'Sync with suppliers and automate stock management',
      status: 'Coming Soon',
      icon: '📦',
      features: ['Auto-reorder alerts', 'Supplier integration', 'Stock forecasting']
    },
    {
      name: 'Customer CRM',
      description: 'Manage customer data, loyalty programs, and marketing',
      status: 'Coming Soon',
      icon: '👥',
      features: ['Customer profiles', 'Loyalty rewards', 'Email marketing']
    },
    {
      name: 'Analytics & Reporting',
      description: 'Advanced analytics with Google Analytics and custom reports',
      status: 'Coming Soon',
      icon: '📊',
      features: ['Real-time insights', 'Custom dashboards', 'Export reports']
    },
    {
      name: 'POS Hardware',
      description: 'Connect with receipt printers, card readers, and kitchen displays',
      status: 'Coming Soon',
      icon: '🖨️',
      features: ['Printer integration', 'Card readers', 'Kitchen displays']
    }
  ]

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
          <h1 className="text-4xl font-bold text-gray-900">🔌 Integrations</h1>
        </div>
        <p className="text-lg text-gray-600">Connect your restaurant with third-party services and tools</p>
      </div>

      {/* Coming Soon Banner */}
      <div className="mb-8 bg-gradient-to-r from-purple-100 to-blue-100 border-l-4 border-purple-500 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🚀</span>
          <h2 className="text-xl font-bold text-purple-900">Coming Soon</h2>
        </div>
        <p className="text-purple-800">
          We're working hard to bring you powerful integrations that will streamline your restaurant operations.
          These features will be available in upcoming updates.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration, index) => (
          <div
            key={integration.name}
            className="group bg-white rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 hover:translate-y-[-4px] animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">{integration.icon}</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{integration.name}</h3>
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                  {integration.status}
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{integration.description}</p>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 text-sm">Features:</h4>
              <ul className="space-y-1">
                {integration.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              disabled
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="mt-12 bg-white rounded-2xl card-shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">💬 Need a Specific Integration?</h2>
        <p className="text-gray-600 mb-6">
          Don't see the integration you need? Contact us to request custom integrations or priority development.
        </p>
        <button
          onClick={() => router.push('/dashboard/contact')}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
        >
          Contact Us for Custom Integrations
        </button>
      </div>
    </div>
  )
}