'use client'

import { motion } from 'framer-motion'
import {
  Globe,
  MousePointer,
  LogIn,
  Building2,
  LayoutGrid,
  BookOpen,
  Receipt,
  BarChart3,
} from 'lucide-react'

const steps = [
  {
    icon: Globe,
    title: 'Visit the Website',
    description: 'User visits the RestaurantPro website',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: MousePointer,
    title: 'Click Get Started',
    description: 'User clicks the Get Started button',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: LogIn,
    title: 'Login or Create Account',
    description: 'User logs in or creates a new account',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Building2,
    title: 'Workspace Created',
    description: 'Restaurant workspace is created automatically',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: LayoutGrid,
    title: 'Tables Initialized',
    description: 'Default tables are initialized in the system',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: BookOpen,
    title: 'Add Menu Items',
    description: 'User adds menu items to the restaurant',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: Receipt,
    title: 'Start Billing',
    description: 'User starts billing customers',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: BarChart3,
    title: 'Reports Update',
    description: 'Reports and analytics update automatically',
    color: 'from-teal-500 to-teal-600',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold mb-4 border border-blue-500/30">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            How It{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Get your restaurant up and running in just 8 simple steps
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-teal-500 -translate-x-1/2"></div>

          {/* Steps */}
          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative lg:flex items-center ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10">
                    <div className={`flex items-center gap-4 ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg shrink-0`}>
                        <step.icon className="text-white" size={22} />
                      </div>
                      <div>
                        <div className="text-sm text-blue-400 font-semibold mb-1">Step {index + 1}</div>
                        <h3 className="text-lg font-bold text-white">{step.title}</h3>
                        <p className="text-gray-400 text-sm">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Node */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 300 }}
                    className={`w-6 h-6 rounded-full bg-gradient-to-br ${step.color} shadow-lg border-4 border-slate-900`}
                  ></motion.div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden lg:block lg:w-5/12"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-4">
            Ready to get started? It only takes a few minutes.
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-400 font-semibold">
            <span>Start your journey today</span>
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