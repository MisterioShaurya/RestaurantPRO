'use client'

import { motion } from 'framer-motion'
import { Shield, Cloud, Zap, CreditCard, Server, Smartphone } from 'lucide-react'

const indicators = [
  {
    icon: Shield,
    title: 'Secure System',
    description: 'Enterprise-grade security with 256-bit SSL encryption',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Cloud,
    title: 'Cloud-Based',
    description: 'Access your data from anywhere, anytime',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Instant sync across all devices and locations',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: CreditCard,
    title: 'Fast Billing',
    description: 'Process orders and payments in seconds',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Server,
    title: 'Reliable System',
    description: '99.9% uptime guarantee with automatic backups',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: Smartphone,
    title: 'Multi-device Support',
    description: 'Works on tablets, phones, and desktops',
    color: 'from-indigo-500 to-violet-500',
  },
]

export default function TrustIndicators() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Restaurants{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Trust Us
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built with enterprise-grade technology to keep your restaurant running smoothly
          </p>
        </motion.div>

        {/* Trust Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {indicators.map((indicator, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-1"
            >
              {/* Gradient Background on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}></div>
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${indicator.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <indicator.icon className="text-white" size={24} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {indicator.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {indicator.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '99.9%', label: 'Uptime' },
            { value: '500+', label: 'Restaurants' },
            { value: '1M+', label: 'Orders Processed' },
            { value: '24/7', label: 'Support' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}