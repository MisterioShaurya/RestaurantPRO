'use client'

import { motion } from 'framer-motion'
import { Check, X, Star } from 'lucide-react'

const features = [
  'Speed',
  'Automation',
  'Cloud Backup',
  'Real-time Reports',
  'Multi-device Support',
  'Security',
  'Scalability',
  'Ease of Use',
]

export default function Comparison() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 -translate-x-1/2"></div>

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
            Compare Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why RestaurantPro is{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Better
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how we compare to traditional POS and manual systems
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <div className="p-6 font-semibold">Feature</div>
            <div className="p-6 text-center font-semibold bg-blue-600/20 border-l border-blue-500/30">
              <div className="flex items-center justify-center gap-2">
                <Star size={18} className="text-yellow-400" />
                RestaurantPro
              </div>
            </div>
            <div className="p-6 text-center font-semibold border-l border-slate-700">
              Traditional POS
            </div>
            <div className="p-6 text-center font-semibold border-l border-slate-700">
              Manual System
            </div>
          </div>

          {/* Table Body */}
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`grid grid-cols-4 ${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              } hover:bg-blue-50/50 transition-colors`}
            >
              <div className="p-5 font-medium text-gray-900 border-t border-gray-100">
                {feature}
              </div>
              <div className="p-5 text-center border-t border-l border-gray-100 bg-blue-50/30">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <Check size={18} className="text-green-600" />
                </div>
              </div>
              <div className="p-5 text-center border-t border-l border-gray-100">
                {index < 3 ? (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                    <span className="text-yellow-600 text-sm font-bold">~</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                    <X size={18} className="text-red-600" />
                  </div>
                )}
              </div>
              <div className="p-5 text-center border-t border-l border-gray-100">
                {index < 2 ? (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                    <span className="text-yellow-600 text-sm font-bold">~</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                    <X size={18} className="text-red-600" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Table Footer */}
          <div className="grid grid-cols-4 bg-gradient-to-r from-slate-100 to-gray-100">
            <div className="p-5 font-semibold text-gray-900">Overall Score</div>
            <div className="p-5 text-center bg-blue-100/50 border-l border-blue-200">
              <span className="text-2xl font-bold text-blue-600">10/10</span>
            </div>
            <div className="p-5 text-center border-l border-gray-200">
              <span className="text-2xl font-bold text-gray-500">5/10</span>
            </div>
            <div className="p-5 text-center border-l border-gray-200">
              <span className="text-2xl font-bold text-gray-400">2/10</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Ready to experience the difference?
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25">
            Get Started Free
          </button>
        </motion.div>
      </div>
    </section>
  )
}