'use client'

import { motion } from 'framer-motion'
import { User, Star, Heart } from 'lucide-react'

const team = [
  {
    name: 'Shaurya Deep',
    role: 'Founder & CEO',
    description: 'Visionary leader with 10+ years in restaurant technology',
    avatar: 'SD',
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Development Team',
    role: 'Engineering',
    description: 'Full-stack developers building the future of restaurant management',
    avatar: 'DT',
    color: 'from-green-500 to-green-600',
  },
  {
    name: 'Support Team',
    role: 'Customer Success',
    description: '24/7 dedicated support to help restaurants succeed',
    avatar: 'ST',
    color: 'from-purple-500 to-purple-600',
  },
]

export default function Team() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 -translate-x-1/2"></div>

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
            Our Team
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Meet the{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              People
            </span>{' '}
            Behind RestaurantPro
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A dedicated team working to revolutionize restaurant management
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                {/* Avatar Section */}
                <div className={`bg-gradient-to-br ${member.color} p-8 text-center`}>
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-white">{member.avatar}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{member.name}</h3>
                  <p className="text-white/80">{member.role}</p>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                  <p className="text-gray-600 leading-relaxed">{member.description}</p>
                  
                  {/* Social Icons Placeholder */}
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <button className="w-10 h-10 bg-gray-100 hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
                      <User size={18} className="text-gray-600" />
                    </button>
                    <button className="w-10 h-10 bg-gray-100 hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
                      <Star size={18} className="text-gray-600" />
                    </button>
                    <button className="w-10 h-10 bg-gray-100 hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
                      <Heart size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Shaurya | Nexus Credit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">Made with love by</p>
              <p className="font-bold text-gray-900">Team Shaurya | Nexus</p>
            </div>
          </div>
          <p className="text-gray-500 mt-4 text-sm">
            Visit us at{' '}
            <a href="https://shauryadeep.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              shauryadeep.in
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}