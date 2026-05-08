'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, Loader, ChefHat, Shield } from 'lucide-react'
import Link from 'next/link'

export default function PlansPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'>('PROFESSIONAL')
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

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

  const plans = [
    {
      id: 'STARTER' as const,
      name: 'Starter',
      price: billingCycle === 'MONTHLY' ? '₹999' : '₹9,999',
      period: billingCycle === 'MONTHLY' ? '/mo' : '/yr',
      save: billingCycle === 'YEARLY' ? 'Save 17%' : '',
      features: ['Up to 5 tables', 'Basic billing', 'Daily reports', 'Email support', 'Mobile app access'],
      icon: '🌱',
      popular: false,
    },
    {
      id: 'PROFESSIONAL' as const,
      name: 'Professional',
      price: billingCycle === 'MONTHLY' ? '₹2,499' : '₹24,999',
      period: billingCycle === 'MONTHLY' ? '/mo' : '/yr',
      save: billingCycle === 'YEARLY' ? 'Save 17%' : '',
      features: ['Up to 20 tables', 'Advanced analytics', 'KOT system', 'Priority support', 'Staff management', 'Inventory tracking'],
      icon: '🚀',
      popular: true,
    },
    {
      id: 'ENTERPRISE' as const,
      name: 'Enterprise',
      price: billingCycle === 'MONTHLY' ? '₹4,999' : '₹49,999',
      period: billingCycle === 'MONTHLY' ? '/mo' : '/yr',
      save: billingCycle === 'YEARLY' ? 'Save 17%' : '',
      features: ['Unlimited tables', 'Custom integrations', 'Dedicated manager', '24/7 support', 'API access', 'Multi-location'],
      icon: '🏢',
      popular: false,
    },
  ]

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/signup')
    }
  }, [router])

  const handleSelectPlan = async () => {
    setProcessing(true)

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Store selected plan
    localStorage.setItem('selectedPlan', JSON.stringify({
      plan: selectedPlan,
      billingCycle,
      price: plans.find(p => p.id === selectedPlan)?.price,
    }))

    setSuccess(true)
    setProcessing(false)

    // Redirect to dashboard after successful "payment"
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: lavender.lighter }}>
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-green-100">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif', color: lavender.text }}>
            Welcome Aboard! 🎉
          </h2>
          <p className="text-lg mb-6" style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>
            Your <strong>{selectedPlan}</strong> plan has been activated successfully. 
            Redirecting you to your dashboard...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: lavender.primary }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-6 relative overflow-hidden" style={{ background: lavender.lighter }}>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" 
             style={{ background: `radial-gradient(circle, ${lavender.accent}, transparent)` }}></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl" 
             style={{ background: `radial-gradient(circle, ${lavender.primary}, transparent)` }}></div>
      </div>

      <div className="container mx-auto relative z-10 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
               style={{ background: `linear-gradient(135deg, ${lavender.primary}, ${lavender.accent})` }}>
            <ChefHat className="text-white" size={28} />
          </div>
          <h1 className="text-4xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: lavender.text }}>
            Choose Your Plan
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>
            Select the perfect plan for your restaurant. Start with a 14-day free trial — no credit card required.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center p-1 rounded-2xl" 
               style={{ background: `${lavender.primary}15`, border: `1px solid ${lavender.primary}20` }}>
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                billingCycle === 'MONTHLY' ? 'shadow-md' : ''
              }`}
              style={{ 
                background: billingCycle === 'MONTHLY' ? lavender.white : 'transparent',
                color: billingCycle === 'MONTHLY' ? lavender.primary : lavender.textLight,
                fontFamily: 'DM Sans'
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                billingCycle === 'YEARLY' ? 'shadow-md' : ''
              }`}
              style={{ 
                background: billingCycle === 'YEARLY' ? lavender.white : 'transparent',
                color: billingCycle === 'YEARLY' ? lavender.primary : lavender.textLight,
                fontFamily: 'DM Sans'
              }}
            >
              Yearly <span className="text-xs" style={{ color: '#D4A853' }}>Save 17%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`rounded-2xl p-8 cursor-pointer transition-all duration-500 relative ${
                selectedPlan === plan.id ? 'scale-105' : 'hover:-translate-y-2'
              }`}
              style={{ 
                background: selectedPlan === plan.id 
                  ? `linear-gradient(135deg, ${lavender.primary}, ${lavender.accent})`
                  : `${lavender.white}ee`,
                backdropFilter: 'blur(20px)',
                boxShadow: selectedPlan === plan.id 
                  ? `0 20px 60px ${lavender.primary}40`
                  : `0 10px 40px ${lavender.primary}15`,
                border: selectedPlan === plan.id ? 'none' : `1px solid ${lavender.primary}20`,
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-sm font-bold text-white shadow-lg flex items-center gap-1"
                        style={{ background: '#D4A853' }}>
                    ⭐ Most Popular
                  </span>
                </div>
              )}

              <div className="text-4xl mb-4">{plan.icon}</div>
              
              <h3 className="text-2xl font-bold mb-2" 
                  style={{ fontFamily: 'Playfair Display', color: selectedPlan === plan.id ? lavender.white : lavender.text }}>
                {plan.name}
              </h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold" 
                      style={{ fontFamily: 'Playfair Display', color: selectedPlan === plan.id ? lavender.white : lavender.text }}>
                  {plan.price}
                </span>
                <span style={{ color: selectedPlan === plan.id ? `${lavender.white}cc` : lavender.textLight }}>
                  {plan.period}
                </span>
                {plan.save && (
                  <span className="block text-xs font-medium mt-1" 
                        style={{ color: selectedPlan === plan.id ? '#D4A853' : '#D4A853' }}>
                    {plan.save}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm"
                      style={{ color: selectedPlan === plan.id ? lavender.white : lavender.textLight, fontFamily: 'DM Sans' }}>
                    <Check className="h-4 w-4 shrink-0" style={{ color: selectedPlan === plan.id ? '#D4A853' : lavender.primary }} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Select button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPlan(plan.id)
                }}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
                style={{ 
                  background: selectedPlan === plan.id ? lavender.white : lavender.primary,
                  color: selectedPlan === plan.id ? lavender.primary : lavender.white,
                  fontFamily: 'DM Sans',
                  boxShadow: selectedPlan === plan.id ? 'none' : `0 4px 15px ${lavender.primary}30`
                }}
              >
                {selectedPlan === plan.id ? '✓ Selected' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Proceed Button */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full" 
               style={{ background: `${lavender.primary}10`, border: `1px solid ${lavender.primary}20` }}>
            <Shield size={14} style={{ color: lavender.primary }} />
            <span className="text-xs font-medium" style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>
              14-day free trial. Cancel anytime.
            </span>
          </div>
          
          <button
            onClick={handleSelectPlan}
            disabled={processing}
            className="px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105 hover:shadow-2xl inline-flex items-center gap-2"
            style={{ 
              background: `linear-gradient(135deg, ${lavender.primary}, ${lavender.accent})`,
              color: lavender.white,
              fontFamily: 'DM Sans',
              boxShadow: `0 10px 30px ${lavender.primary}40`
            }}
          >
            {processing ? (
              <>
                <Loader size={20} className="animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                Start Free Trial <ChevronRight size={20} />
              </>
            )}
          </button>

          <p className="mt-4 text-xs" style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>
            🔒 Secure payment powered by RestaurantPro (dummy gateway)
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-10">
          <Link href="/" className="text-sm font-medium transition-all duration-200 hover:opacity-70"
                style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}