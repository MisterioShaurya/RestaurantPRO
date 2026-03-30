'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    restaurant: 'Spice Garden',
    owner: 'Rajesh Kumar',
    review: 'RestaurantPro transformed our operations. Billing is 3x faster and we never miss an order. The real-time sync across devices is a game changer!',
    rating: 5,
    avatar: 'RK',
    color: 'from-blue-500 to-blue-600',
  },
  {
    restaurant: 'Cafe Milano',
    owner: 'Priya Sharma',
    review: 'The best investment we made. Table management is so easy now, and the reports help us understand our business better than ever.',
    rating: 5,
    avatar: 'PS',
    color: 'from-purple-500 to-purple-600',
  },
  {
    restaurant: 'The Hungry Fork',
    owner: 'Amit Patel',
    review: 'From manual billing to RestaurantPro - the difference is night and day. Our staff loves it, and customers appreciate the quick service.',
    rating: 5,
    avatar: 'AP',
    color: 'from-green-500 to-green-600',
  },
  {
    restaurant: 'Tandoori Nights',
    owner: 'Sneha Reddy',
    review: 'Cloud backup saved us twice already! The subscription management feature is perfect for our growing chain of restaurants.',
    rating: 5,
    avatar: 'SR',
    color: 'from-orange-500 to-orange-600',
  },
  {
    restaurant: 'Urban Bites',
    owner: 'Vikram Singh',
    review: 'Multi-device support is fantastic. We use tablets for orders, phones for kitchen, and desktop for management. All synced perfectly!',
    rating: 5,
    avatar: 'VS',
    color: 'from-pink-500 to-pink-600',
  },
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold mb-4 border border-blue-500/30">
            Customer Stories
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Loved by{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Restaurants
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            See what restaurant owners are saying about RestaurantPro
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative">
          {/* Main Testimonial */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 sm:p-12"
            >
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Avatar */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${testimonials[currentIndex].color} flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0`}>
                  {testimonials[currentIndex].avatar}
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  {/* Quote Icon */}
                  <Star size={32} className="text-blue-400/30 mb-4 mx-auto lg:mx-0" />

                  {/* Review */}
                  <p className="text-lg sm:text-xl text-gray-200 leading-relaxed mb-6">
                    "{testimonials[currentIndex].review}"
                  </p>

                  {/* Rating */}
                  <div className="flex items-center justify-center lg:justify-start gap-1 mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>

                  {/* Author */}
                  <div>
                    <p className="text-white font-semibold text-lg">
                      {testimonials[currentIndex].owner}
                    </p>
                    <p className="text-gray-400">
                      {testimonials[currentIndex].restaurant}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    setIsAutoPlaying(false)
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-blue-400 w-8'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '500+', label: 'Happy Restaurants' },
            { value: '4.9/5', label: 'Average Rating' },
            { value: '1M+', label: 'Orders Processed' },
            { value: '99%', label: 'Would Recommend' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}