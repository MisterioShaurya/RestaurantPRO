'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, AlertCircle, CheckCircle, UserPlus, Eye, EyeOff, Loader } from 'lucide-react'
import DesktopOnlyWrapper from '@/components/desktop-only-wrapper'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    restaurantName: '',
    subscriptionType: 'MONTHLY' as 'MONTHLY' | 'YEARLY'
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!isLogin) {
      if (!formData.username.trim()) errors.username = 'Username is required'
      if (!formData.email.trim()) errors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format'
      if (!formData.password) errors.password = 'Password is required'
      else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
      if (!formData.passwordConfirm) errors.passwordConfirm = 'Please confirm your password'
      else if (formData.password !== formData.passwordConfirm) errors.passwordConfirm = 'Passwords do not match'
      if (!formData.restaurantName.trim()) errors.restaurantName = 'Restaurant name is required'
    } else {
      if (!formData.email.trim()) errors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format'
      if (!formData.password) errors.password = 'Password is required'
    }

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
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            passwordConfirm: formData.passwordConfirm,
            restaurantName: formData.restaurantName,
            subscriptionType: formData.subscriptionType
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Authentication failed')
        return
      }

      if (isLogin) {
        // Store JWT token and user data in localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Also store in cookies for server-side authentication
        document.cookie = `token=${data.token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`
        document.cookie = `userRole=${data.user.role || 'admin'}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`

        setSuccess('Login successful! Redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        setSuccess('Account created successfully! Switching to login...')
        setTimeout(() => {
          setIsLogin(true)
          setFormData({
            username: '',
            email: '',
            password: '',
            passwordConfirm: '',
            restaurantName: '',
            subscriptionType: 'MONTHLY'
          })
          setFieldErrors({})
          setSuccess('')
        }, 2000)
      }
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
    <DesktopOnlyWrapper>
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl mb-4">
              <Lock className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-slate-600 text-sm mt-2">
              {isLogin
                ? 'Sign in to your restaurant dashboard'
                : 'Set up your restaurant management system'
              }
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setIsLogin(true)
                setError('')
                setFieldErrors({})
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                isLogin
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setError('')
                setFieldErrors({})
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-4 animate-in fade-in">
              <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 font-medium">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 animate-in fade-in">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Login/Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                {/* Username Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                      fieldErrors.username
                        ? 'border-red-300 bg-red-50/30 focus:border-red-500'
                        : 'border-slate-200 focus:border-blue-500 focus:bg-blue-50/30'
                    }`}
                    placeholder="your_username"
                  />
                  {fieldErrors.username && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>
                  )}
                </div>

                {/* Restaurant Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={formData.restaurantName}
                    onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                      fieldErrors.restaurantName
                        ? 'border-red-300 bg-red-50/30 focus:border-red-500'
                        : 'border-slate-200 focus:border-blue-500 focus:bg-blue-50/30'
                    }`}
                    placeholder="Your Restaurant"
                  />
                  {fieldErrors.restaurantName && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.restaurantName}</p>
                  )}
                </div>

                {/* Subscription Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Plan
                  </label>
                  <select
                    value={formData.subscriptionType}
                    onChange={(e) => handleInputChange('subscriptionType', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none focus:bg-blue-50/30 transition-all duration-200"
                  >
                    <option value="MONTHLY">Monthly - ₹999/month</option>
                    <option value="YEARLY">Yearly - ₹9999/year (Save 17%)</option>
                  </select>
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-1">
                  <Mail size={16} /> Email
                </span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                  fieldErrors.email
                    ? 'border-red-300 bg-red-50/30 focus:border-red-500'
                    : 'border-slate-200 focus:border-blue-500 focus:bg-blue-50/30'
                }`}
                placeholder="admin@restaurant.com"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-1">
                  <Lock size={16} /> Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 pr-10 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                    fieldErrors.password
                      ? 'border-red-300 bg-red-50/30 focus:border-red-500'
                      : 'border-slate-200 focus:border-blue-500 focus:bg-blue-50/30'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-1">
                    <Lock size={16} /> Confirm Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.passwordConfirm}
                    onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                    className={`w-full px-4 py-3 pr-10 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                      fieldErrors.passwordConfirm
                        ? 'border-red-300 bg-red-50/30 focus:border-red-500'
                        : 'border-slate-200 focus:border-blue-500 focus:bg-blue-50/30'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.passwordConfirm && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.passwordConfirm}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Toggle between login and signup */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm mb-3">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setFieldErrors({})
                setSuccess('')
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              {isLogin ? 'Create one here' : 'Sign in here'}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-6 pt-6 border-t border-slate-200">
            Enterprise Restaurant POS with Subscription Management
          </p>
        </div>
      </div>
    </div>
    </DesktopOnlyWrapper>
  )
}
