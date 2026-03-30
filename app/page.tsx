'use client'

import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import TrustIndicators from '@/components/landing/TrustIndicators'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import WorkflowValidation from '@/components/landing/WorkflowValidation'
import DatabaseIsolation from '@/components/landing/DatabaseIsolation'
import Comparison from '@/components/landing/Comparison'
import Testimonials from '@/components/landing/Testimonials'
import Pricing from '@/components/landing/Pricing'
import Contact from '@/components/landing/Contact'
import Team from '@/components/landing/Team'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <TrustIndicators />
      <Features />
      <HowItWorks />
      <WorkflowValidation />
      <DatabaseIsolation />
      <Comparison />
      <Testimonials />
      <Pricing />
      <Contact />
      <Team />
      <FinalCTA />
      <Footer />
    </main>
  )
}