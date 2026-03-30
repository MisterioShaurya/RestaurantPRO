'use client'

import { motion } from 'framer-motion'
import {
  User,
  Settings,
  Package,
  Mail,
  CheckCircle2,
  Home,
  SortAsc,
  Eye,
} from 'lucide-react'

const users = [
  {
    name: 'User A',
    restaurant: 'Restaurant A Database',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    name: 'User B',
    restaurant: 'Restaurant B Database',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  {
    name: 'User C',
    restaurant: 'Restaurant C Database',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
]

const dataTypes = [
  { icon: Package, label: 'Tables' },
  { icon: Mail, label: 'Bills' },
  { icon: CheckCircle2, label: 'Orders' },
  { icon: Home, label: 'Menu' },
  { icon: User, label: 'Staff' },
  { icon: SortAsc, label: 'Reports' },
]

export default function DatabaseIsolation() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100 rounded-full blur-3xl opacity-30"></div>

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
            Multi-Tenant Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Every Restaurant Has Its Own{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Secure Database
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete data isolation ensures your restaurant's data is never mixed with others
          </p>
        </motion.div>

        {/* Visualization */}
        <div className="relative">
          {/* Central Lock Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:block"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-2xl">
              <Eye className="text-white" size={32} />
            </div>
          </motion.div>

          {/* User Databases */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {users.map((user, userIndex) => (
              <motion.div
                key={userIndex}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: userIndex * 0.15 }}
                className="relative"
              >
                {/* User Card */}
                <div className={`bg-white rounded-2xl shadow-xl border-2 ${user.borderColor} overflow-hidden`}>
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${user.color} p-4`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <User className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{user.name}</h3>
                        <p className="text-white/80 text-sm">{user.restaurant}</p>
                      </div>
                    </div>
                  </div>

                  {/* Data Types Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-3">
                      {dataTypes.map((dataType, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: userIndex * 0.15 + index * 0.05 }}
                          className={`${user.bgColor} rounded-lg p-3 flex items-center gap-2`}
                        >
                          <dataType.icon size={16} className="text-gray-700" />
                          <span className="text-sm font-medium text-gray-700">{dataType.label}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Isolation Badge */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Isolated & Secure</span>
                    </div>
                  </div>
                </div>

                {/* Connection Lines (Desktop) */}
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Package,
              title: 'Separate Databases',
              description: 'Each restaurant has its own isolated database instance',
            },
            {
              icon: Eye,
              title: 'Encrypted Storage',
              description: 'All data is encrypted at rest and in transit',
            },
            {
              icon: User,
              title: 'User Privacy',
              description: 'No cross-user data access or mixing possible',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <item.icon className="text-white" size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}