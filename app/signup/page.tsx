'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    restaurantName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-color-background to-color-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-color-surface border border-color-border rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-color-primary to-color-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">RP</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-color-text mb-2">Create Account</h1>
          <p className="text-center text-color-text-secondary mb-8">Get started with RestaurantPro today</p>

          {error && (
            <div className="mb-6 p-4 bg-color-danger/20 border border-color-danger rounded-lg text-color-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-color-text mb-2">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-color-background border border-color-border rounded-lg text-color-text focus:outline-none focus:border-color-primary transition"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-color-text mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-color-background border border-color-border rounded-lg text-color-text focus:outline-none focus:border-color-primary transition"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-color-text mb-2">Restaurant Name</label>
              <input
                type="text"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-color-background border border-color-border rounded-lg text-color-text focus:outline-none focus:border-color-primary transition"
                placeholder="My Restaurant"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-color-text mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-color-background border border-color-border rounded-lg text-color-text focus:outline-none focus:border-color-primary transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-color-primary hover:bg-color-primary-dark text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-color-text-secondary mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-color-primary hover:text-color-accent transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
