'use client'

import { motion } from 'framer-motion'
import {
  LayoutGrid,
  Receipt,
  ClipboardList,
  BookOpen,
  Users,
  BarChart3,
  CreditCard,
  RefreshCw,
  Cloud,
  Lock,
} from 'lucide-react'

const features = [
  {
    icon: LayoutGrid,
    title: 'Table Management',
    description: 'Manage floor plans, reservations, and table status in real-time',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Receipt,
    title: 'Billing System',
    description: 'Fast and accurate billing with split bills, discounts, and multiple payment options',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: ClipboardList,
    title: 'Order Management',
    description: 'Track orders from kitchen to table with KOT printing and status updates',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: BookOpen,
    title: 'Menu Management',
    description: 'Easy menu updates with categories, pricing, and availability control',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Manage roles, permissions, and track staff performance',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Detailed insights on sales, inventory, and customer trends',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: CreditCard,
    title: 'Subscription Management',
    description: 'Flexible plans with easy renewal and payment tracking',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: RefreshCw,
    title: 'Real-time Sync',
    description: 'Instant synchronization across all devices and locations',
    color: 'from-teal-500 to-teal-600',
  },
  {
    icon: Cloud,
    title: 'Cloud Backup',
    description: 'Automatic daily backups with instant restore capability',
    color: 'from-sky-500 to-sky-600',
  },
  {
    icon: Lock,
    title: 'Secure Login',
    description: 'Multi-factor authentication and role-based access control',
    color: 'from-red-500 to-red-600',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            Powerful Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Run Your Restaurant
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A complete suite of tools designed specifically for modern restaurants
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative"
            >
              <div className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent overflow-hidden h-full">
                {/* Hover Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500" style={{ backgroundImage: `linear-gradient(to bottom right, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})` }}></div>
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} p-[1px]`}>
                    <div className="w-full h-full bg-white rounded-2xl"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <feature.icon className="text-white" size={22} />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Corner Accent */}
                <div className={`absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-4">
            And many more features to help your restaurant thrive
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
            <span>Explore all features</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}