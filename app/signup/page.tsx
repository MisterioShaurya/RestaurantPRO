'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, AlertCircle, CheckCircle, Eye, EyeOff, Loader, ChefHat, Star, User } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    restaurantName: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Lavender color palette matching landing page
  const lavender = {
    primary: '#9B7EC8',
    light: '#E8E0F0',
    lighter: '#F5F0FA',
    dark: '#7B5FA8',
    darkest: '#5B3F78',
    accent: '#C4A7E0',
    text: '#2D1B4E',
    textLight: '#6B5B7B',
    white: '#FFFFFF',
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.username.trim()) errors.username = 'Username is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format'
    if (!formData.password) errors.password = 'Password is required'
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (!formData.passwordConfirm) errors.passwordConfirm = 'Please confirm your password'
    else if (formData.password !== formData.passwordConfirm) errors.passwordConfirm = 'Passwords do not match'
    if (!formData.restaurantName.trim()) errors.restaurantName = 'Restaurant name is required'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setError('Please fix the errors above')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subscriptionType: 'MONTHLY'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Signup failed')
        return
      }

      // Store JWT token and user data in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Also store in cookies for server-side authentication
      document.cookie = `token=${data.token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`
      document.cookie = `userRole=${data.user.role || 'admin'}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`

      setSuccess('Account created! Redirecting to plans...')
      setTimeout(() => {
        router.push('/plans')
      }, 1500)
    } catch (err) {
      setError('Network error. Please check your connection.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: lavender.lighter }}>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl" 
             style={{ background: `radial-gradient(circle, ${lavender.accent}, transparent)` }}></div>
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl" 
             style={{ background: `radial-gradient(circle, ${lavender.primary}, transparent)` }}></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl" 
             style={{ background: `radial-gradient(circle, ${lavender.light}, transparent)` }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="rounded-2xl shadow-2xl p-8 relative overflow-hidden" 
             style={{ background: `${lavender.white}ee`, backdropFilter: 'blur(20px)', border: `1px solid ${lavender.primary}20` }}>
          
          {/* Decorative top accent */}
          <div className="absolute top-0 left-0 right-0 h-1" 
               style={{ background: `linear-gradient(90deg, ${lavender.primary}, ${lavender.accent}, ${lavender.primary})` }}></div>

          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                 style={{ background: `linear-gradient(135deg, ${lavender.primary}, ${lavender.accent})` }}>
              <ChefHat className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: lavender.text }}>
              Create Account
            </h1>
            <p className="text-sm mt-2" style={{ color: lavender.textLight, fontFamily: 'DM Sans, sans-serif' }}>
              Set up your restaurant management system
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex gap-3 p-3 rounded-lg mb-4" style={{ background: '#F0FFF4', border: '1px solid #C6F6D5' }}>
              <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 font-medium">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex gap-3 p-3 rounded-lg mb-4" style={{ background: '#FFF5F5', border: '1px solid #FED7D7' }}>
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>
                <span className="flex items-center gap-1">
                  <User size={16} /> Username
                </span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02] ${
                  fieldErrors.username ? 'border-red-300 bg-red-50/30' : ''
                }`}
                style={{ 
                  borderColor: fieldErrors.username ? undefined : `${lavender.primary}30`,
                  background: lavender.white,
                  fontFamily: 'DM Sans'
                }}
                onFocus={(e) => {
                  if (!fieldErrors.username) e.target.style.borderColor = lavender.primary
                }}
                onBlur={(e) => {
                  if (!fieldErrors.username) e.target.style.borderColor = `${lavender.primary}30`
                }}
                placeholder="your_username"
              />
              {fieldErrors.username && (
                <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.username}</p>
              )}
            </div>

            {/* Restaurant Name Field */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>
                <span className="flex items-center gap-1">
                  <span className="text-base">🏪</span> Restaurant Name
                </span>
              </label>
              <input
                type="text"
                value={formData.restaurantName}
                onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02] ${
                  fieldErrors.restaurantName ? 'border-red-300 bg-red-50/30' : ''
                }`}
                style={{ 
                  borderColor: fieldErrors.restaurantName ? undefined : `${lavender.primary}30`,
                  background: lavender.white,
                  fontFamily: 'DM Sans'
                }}
                onFocus={(e) => {
                  if (!fieldErrors.restaurantName) e.target.style.borderColor = lavender.primary
                }}
                onBlur={(e) => {
                  if (!fieldErrors.restaurantName) e.target.style.borderColor = `${lavender.primary}30`
                }}
                placeholder="Your Restaurant"
              />
              {fieldErrors.restaurantName && (
                <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.restaurantName}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>
                <span className="flex items-center gap-1">
                  <Mail size={16} /> Email
                </span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02] ${
                  fieldErrors.email ? 'border-red-300 bg-red-50/30' : ''
                }`}
                style={{ 
                  borderColor: fieldErrors.email ? undefined : `${lavender.primary}30`,
                  background: lavender.white,
                  fontFamily: 'DM Sans'
                }}
                onFocus={(e) => {
                  if (!fieldErrors.email) e.target.style.borderColor = lavender.primary
                }}
                onBlur={(e) => {
                  if (!fieldErrors.email) e.target.style.borderColor = `${lavender.primary}30`
                }}
                placeholder="admin@restaurant.com"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>
                <span className="flex items-center gap-1">
                  <Lock size={16} /> Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02] ${
                    fieldErrors.password ? 'border-red-300 bg-red-50/30' : ''
                  }`}
                  style={{ 
                    borderColor: fieldErrors.password ? undefined : `${lavender.primary}30`,
                    background: lavender.white,
                    fontFamily: 'DM Sans'
                  }}
                  onFocus={(e) => {
                    if (!fieldErrors.password) e.target.style.borderColor = lavender.primary
                  }}
                  onBlur={(e) => {
                    if (!fieldErrors.password) e.target.style.borderColor = `${lavender.primary}30`
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: lavender.textLight }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>
                <span className="flex items-center gap-1">
                  <Lock size={16} /> Confirm Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.passwordConfirm}
                  onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02] ${
                    fieldErrors.passwordConfirm ? 'border-red-300 bg-red-50/30' : ''
                  }`}
                  style={{ 
                    borderColor: fieldErrors.passwordConfirm ? undefined : `${lavender.primary}30`,
                    background: lavender.white,
                    fontFamily: 'DM Sans'
                  }}
                  onFocus={(e) => {
                    if (!fieldErrors.passwordConfirm) e.target.style.borderColor = lavender.primary
                  }}
                  onBlur={(e) => {
                    if (!fieldErrors.passwordConfirm) e.target.style.borderColor = `${lavender.primary}30`
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: lavender.textLight }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.passwordConfirm && (
                <p className="text-xs text-red-600 mt-1 font-medium">{fieldErrors.passwordConfirm}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-lg mt-6"
              style={{ 
                background: `linear-gradient(135deg, ${lavender.primary}, ${lavender.accent})`,
                color: lavender.white,
                fontFamily: 'DM Sans'
              }}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold transition-colors duration-200 hover:opacity-80"
                    style={{ color: lavender.primary }}>
                Sign in here
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 text-center" style={{ borderTop: `1px solid ${lavender.primary}20` }}>
            <div className="flex items-center justify-center gap-1 mb-2">
              <Star size={12} style={{ color: '#D4A853', fill: '#D4A853' }} />
              <Star size={12} style={{ color: '#D4A853', fill: '#D4A853' }} />
              <Star size={12} style={{ color: '#D4A853', fill: '#D4A853' }} />
              <Star size={12} style={{ color: '#D4A853', fill: '#D4A853' }} />
              <Star size={12} style={{ color: '#D4A853', fill: '#D4A853' }} />
            </div>
            <p className="text-xs" style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>
              Join 500+ restaurants across India
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm font-medium transition-all duration-200 hover:opacity-70"
                style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}