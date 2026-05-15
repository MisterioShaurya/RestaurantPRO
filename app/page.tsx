'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { persistentUserStorage } from '@/lib/persistent-user-storage';
import { 
  ChefHat, Clock, Users, Shield, ChevronRight, Star, Utensils, BarChart3,
  Check, Mail, Phone, MapPin, Menu, X, Heart, ChevronDown, Package, Truck,
  Settings, DollarSign, ShoppingBag, Bell, Filter, SortAsc, RefreshCw, Printer,
  Lock, Zap, Globe, Award, TrendingUp, ShieldCheck, CreditCard, Headphones,
  Monitor, Smartphone, PlayCircle, HardDrive, Calendar, File, Cloud, Wifi,
  Database, MessageSquare, FileText, RefreshCcw, Rocket, ArrowRight, CheckCircle2,
  TrendingDown, Coffee, ChefHat as Chef, Building2, Quote, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [counters, setCounters] = useState({ restaurants: 0, orders: 0, uptime: 0, rating: 0 });
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const currentUser = persistentUserStorage.getCurrentUser();
      const systemLocked = persistentUserStorage.isLocked();
      if (currentUser && !systemLocked) {
        router.push('/dashboard');
      } else {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
      setScrolled(scrollTop > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stats counter animation triggered by scroll
  useEffect(() => {
    const handleScrollForStats = () => {
      if (!statsAnimated) {
        const statsSection = document.querySelector('[data-section="stats"]');
        if (statsSection) {
          const rect = statsSection.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            setStatsAnimated(true);
            animateCounters();
          }
        }
      }
    };
    window.addEventListener('scroll', handleScrollForStats);
    handleScrollForStats();
    return () => window.removeEventListener('scroll', handleScrollForStats);
  }, [statsAnimated]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const animateCounters = () => {
    const targets = { restaurants: 500, orders: 1000000, uptime: 99.9, rating: 4.9 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCounters({
        restaurants: Math.round(targets.restaurants * easeProgress),
        orders: Math.round(targets.orders * easeProgress),
        uptime: parseFloat((targets.uptime * easeProgress).toFixed(1)),
        rating: parseFloat((targets.rating * easeProgress).toFixed(1))
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
  };

  const lv = {
    primary: '#9B7EC8',
    light: '#E8E0F0',
    lighter: '#F5F0FA',
    dark: '#7B5FA8',
    darkest: '#5B3F78',
    accent: '#C4A7E0',
    text: '#2D1B4E',
    textLight: '#6B5B7B',
    white: '#FFFFFF',
    cardBg: 'rgba(255, 255, 255, 0.9)',
  };

  const features = [
    { icon: <Utensils className="h-7 w-7" />, title: "Smart Table Management", desc: "Visual floor plan with real-time status tracking, reservations, and waitlist management" },
    { icon: <Zap className="h-7 w-7" />, title: "Lightning-Fast Billing", desc: "Process bills in 3 seconds with split bills, discounts, and multiple payment options" },
    { icon: <Package className="h-7 w-7" />, title: "KOT & Order Tracking", desc: "Kitchen display system with real-time order status from table to plate" },
    { icon: <BarChart3 className="h-7 w-7" />, title: "Real-Time Analytics", desc: "Auto-generated reports with actionable insights to boost your revenue" },
    { icon: <Users className="h-7 w-7" />, title: "Staff Management", desc: "Role-based permissions, shift tracking, and performance monitoring" },
    { icon: <Cloud className="h-7 w-7" />, title: "Cloud Backup", desc: "Automatic cloud sync with access from any device, anywhere" }
  ];

  const newFeatures = [
    { icon: <Wifi className="h-5 w-5" />, title: "Offline Mode", desc: "Works without internet" },
    { icon: <Printer className="h-5 w-5" />, title: "Print Integration", desc: "Thermal printer support" },
    { icon: <Bell className="h-5 w-5" />, title: "Smart Notifications", desc: "Real-time alerts" },
    { icon: <Database className="h-5 w-5" />, title: "Inventory Sync", desc: "Auto stock updates" },
    { icon: <Calendar className="h-5 w-5" />, title: "Reservation System", desc: "Online bookings" },
    { icon: <MessageSquare className="h-5 w-5" />, title: "Customer Feedback", desc: "In-app reviews" },
    { icon: <FileText className="h-5 w-5" />, title: "GST Compliance", desc: "Auto tax calculation" },
    { icon: <RefreshCcw className="h-5 w-5" />, title: "Multi-Outlet", desc: "Manage all branches" }
  ];

  const integrations = [
    { name: "Google Pay", icon: "💳", color: '#4285F4' },
    { name: "PhonePe", icon: "📱", color: '#5F259F' },
    { name: "Paytm", icon: "💰", color: '#002970' },
    { name: "Razorpay", icon: "🔐", color: '#3395FF' },
    { name: "Swiggy", icon: "🛵", color: '#FC8019' },
    { name: "Zomato", icon: "🍕", color: '#E23744' },
    { name: "WhatsApp", icon: "💬", color: '#25D366' },
    { name: "SMS Gateway", icon: "📲", color: '#9B7EC8' }
  ];

  const testimonials = [
    { name: "Priya Sharma", restaurant: "Spice Route, Mumbai", quote: "RestaurantPro transformed our billing speed. We process 3x more orders during peak hours now!", avatar: "PS", rating: 5, revenue: "+45% Revenue", color: lv.primary },
    { name: "Rahul Mehta", restaurant: "Spice Garden, Delhi", quote: "Real-time analytics helped us identify best sellers and optimize the menu perfectly!", avatar: "RM", rating: 5, revenue: "+32% Efficiency", color: lv.dark },
    { name: "Anita Patel", restaurant: "The Coastal Kitchen, Pune", quote: "KOT tracking eliminated kitchen chaos. Order accuracy is now at 99%!", avatar: "AP", rating: 5, revenue: "99% Accuracy", color: lv.accent }
  ];

  const pricingPlans = [
    { name: "Starter", price: "₹999", period: "/mo", features: ["Up to 5 tables", "Basic billing", "Daily reports", "Email support", "Mobile app"], popular: false, cta: "Start Free Trial" },
    { name: "Professional", price: "₹2,499", period: "/mo", features: ["Up to 20 tables", "Advanced analytics", "KOT system", "Priority support", "Staff management", "Inventory tracking"], popular: true, cta: "Start Free Trial" },
    { name: "Enterprise", price: "₹4,999", period: "/mo", features: ["Unlimited tables", "Custom integrations", "Dedicated manager", "24/7 support", "API access", "Multi-location"], popular: false, cta: "Contact Sales" }
  ];

  const howItWorks = [
    { step: "01", title: "Sign Up in Minutes", desc: "Create your account, add your tables and menu. Zero technical knowledge required.", icon: <Rocket className="h-6 w-6" /> },
    { step: "02", title: "Train Your Staff", desc: "Intuitive interface means staff learns in under 10 minutes. No lengthy training needed.", icon: <Users className="h-6 w-6" /> },
    { step: "03", title: "Start Taking Orders", desc: "Go live immediately. Process orders, track KOTs, and manage tables in real time.", icon: <Utensils className="h-6 w-6" /> },
    { step: "04", title: "Grow With Analytics", desc: "Use daily insights to optimize your menu, reduce waste, and boost profitability.", icon: <TrendingUp className="h-6 w-6" /> }
  ];

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: lv.lighter }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: lv.primary }}></div>
          <p style={{ color: lv.text, fontFamily: 'DM Sans, sans-serif' }}>Loading RestaurantPro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: lv.lighter }}>

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60]" style={{ 
        background: `linear-gradient(90deg, ${lv.primary} ${scrollProgress}%, transparent ${scrollProgress}%)`,
        transition: 'background 0.1s ease-out'
      }} />

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}
        style={{ 
          background: scrolled ? `rgba(245, 240, 250, 0.95)` : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled ? `0 1px 0 ${lv.primary}20, 0 4px 24px ${lv.primary}10` : 'none'
        }}>
        <nav className="px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🍽️</span>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: lv.text }}>RestaurantPro</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-bold animate-pulse"
                style={{ background: `${lv.primary}20`, color: lv.primary }}>PRO</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'How It Works', 'Pricing', 'Testimonials', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-sm font-medium transition-all duration-300 hover:opacity-70 relative group"
                  style={{ fontFamily: 'DM Sans, sans-serif', color: lv.text }}>
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ background: lv.primary }} />
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <Button variant="ghost" onClick={() => router.push('/login')}
                className="transition-all duration-300 hover:scale-105 rounded-full px-5"
                style={{ color: lv.text, fontFamily: 'DM Sans' }}>
                Login
              </Button>
              <Button onClick={() => router.push('/signup')}
                className="rounded-full px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ background: lv.primary, color: lv.white, fontFamily: 'DM Sans' }}>
                Get Started Free <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <button className="md:hidden transition-transform duration-300 hover:scale-110"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen
                ? <X className="h-6 w-6" style={{ color: lv.text }} />
                : <Menu className="h-6 w-6" style={{ color: lv.text }} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4 border-t pt-4 animate-slideDown" style={{ borderColor: `${lv.primary}30` }}>
              {['Features', 'How It Works', 'Pricing', 'Testimonials', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="block text-sm font-medium py-2"
                  style={{ color: lv.text, fontFamily: 'DM Sans' }}
                  onClick={() => setMobileMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t" style={{ borderColor: `${lv.primary}30` }}>
                <Button variant="outline" onClick={() => router.push('/login')}
                  style={{ borderColor: lv.primary, color: lv.primary }}>Login</Button>
                <Button onClick={() => router.push('/signup')}
                  style={{ background: lv.primary, color: lv.white }}>Get Started Free</Button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-25 blur-2xl"
            style={{ background: `radial-gradient(circle, ${lv.accent}, transparent)` }} />
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full opacity-20 blur-2xl"
            style={{ background: `radial-gradient(circle, ${lv.primary}, transparent)` }} />
          <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full opacity-15 blur-2xl"
            style={{ background: `radial-gradient(circle, ${lv.light}, transparent)` }} />
        </div>

        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="text-center lg:text-left animate-fadeInUp">
              <div className="inline-flex items-center px-4 py-2 rounded-full mb-6"
                style={{ background: `${lv.primary}15`, border: `1px solid ${lv.primary}30` }}>
                <Star className="h-4 w-4 mr-2 fill-current" style={{ color: lv.dark }} />
                <span className="text-sm font-medium" style={{ color: lv.primary, fontFamily: 'DM Sans' }}>✦ Trusted by 500+ Restaurants across India</span>
              </div>

              <h1 className="text-4xl md:text-4xl lg:text-6xl font-bold mb-6 leading-tight"
                style={{ fontFamily: 'Playfair Display, serif', color: lv.text }}>
                Run Your Restaurant Like a{' '}
                <span className="relative inline-block">
                  <span style={{ color: lv.primary }}>5-Star</span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8">
                    <path d="M0 6 Q50 0 100 6 T200 6" stroke={lv.accent} strokeWidth="3" fill="none" />
                  </svg>
                </span>
                {' '}Operation
              </h1>

              <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0"
                style={{ color: lv.textLight, fontFamily: 'DM Sans', lineHeight: '1.8' }}>
                RestaurantPro handles billing, tables, orders, and analytics — focus on food, not paperwork.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button size="lg" onClick={() => router.push('/signup')}
                  className="rounded-full px-6 py-4 text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-lg hover:scale-105 group"
                  style={{ background: lv.primary, color: lv.white, fontFamily: 'DM Sans' }}>
                  🚀 Start Free Trial
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline"
                  className="rounded-full px-6 py-4 text-base border-2 transition-all duration-300 hover:scale-105"
                  style={{ borderColor: lv.primary, color: lv.primary, fontFamily: 'DM Sans', background: 'transparent' }}>
                  <PlayCircle className="mr-2 h-5 w-5" /> Watch Demo
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm mb-8"
                style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>
                <span className="flex items-center gap-1"><Check className="h-4 w-4" style={{ color: lv.primary }} /> No credit card</span>
                <span className="flex items-center gap-1"><Check className="h-4 w-4" style={{ color: lv.primary }} /> 5 min setup</span>
                <span className="flex items-center gap-1"><Check className="h-4 w-4" style={{ color: lv.primary }} /> 14-day free trial</span>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-3">
                  {['PS', 'RM', 'AP', 'VK', 'SD'].map((initials, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-md hover:scale-110 hover:z-10 transition-transform"
                      style={{ background: [lv.primary, lv.dark, lv.accent, lv.darkest, '#B8A0D0'][i], color: lv.white }}>
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" style={{ color: '#D4A853' }} />)}
                  </div>
                  <span className="text-sm" style={{ color: lv.textLight }}>500+ happy owners</span>
                </div>
              </div>
            </div>

            {/* Right — Dashboard Mockup */}
            <div className="relative animate-fadeInRight">
              <div className="rounded-xl p-5 shadow-lg relative overflow-hidden"
                style={{ background: lv.darkest, border: `1px solid ${lv.primary}40` }}>
                <div className="absolute inset-0 opacity-10"
                  style={{ background: `linear-gradient(135deg, ${lv.primary}, transparent)` }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🍽️</span>
                      <span className="font-bold text-white text-lg" style={{ fontFamily: 'Playfair Display' }}>Live Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(74,222,128,0.15)' }}>
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-xs font-medium">Live</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'Orders Today', value: '247', icon: '📋', change: '+12%' },
                      { label: 'Revenue', value: '₹45K', icon: '💰', change: '+8%' },
                      { label: 'Active Tables', value: '18/20', icon: '🍽️', change: '90%' }
                    ].map((stat, i) => (
                      <div key={i} className="rounded-xl p-3 hover:scale-105 transition-transform"
                        style={{ background: `${lv.primary}15`, border: `1px solid ${lv.primary}25` }}>
                        <p className="text-xs text-gray-400 mb-1">{stat.icon} {stat.label}</p>
                        <p className="text-lg font-bold" style={{ color: lv.accent }}>{stat.value}</p>
                        <p className="text-xs text-green-400">{stat.change}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Recent Orders</p>
                    {[
                      { table: 'Table #5', item: 'Butter Chicken + Naan', amount: '₹1,250', status: 'Preparing', color: 'yellow' },
                      { table: 'Table #2', item: 'Pasta Alfredo', amount: '₹890', status: 'Ready', color: 'green' },
                      { table: 'Table #8', item: 'Paneer Pizza', amount: '₹1,100', status: 'Served', color: 'blue' }
                    ].map((order, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:translate-x-1 transition-transform"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: lv.primary }}>
                            <Utensils className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{order.table}</p>
                            <p className="text-gray-400 text-xs">{order.item}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-semibold block text-sm">{order.amount}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${order.color === 'green' ? 'bg-green-500/20 text-green-400' : order.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${lv.primary}20` }}>
                    <p className="text-xs text-gray-400 mb-2">Revenue this week</p>
                    <div className="flex items-end gap-1.5 h-12">
                      {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t transition-all duration-1000"
                          style={{ height: `${h}%`, background: i === 5 ? lv.accent : `${lv.primary}50` }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <span key={i} className="text-xs text-gray-500 flex-1 text-center">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 rounded-xl p-3 shadow-lg animate-float"
                style={{ background: lv.white, border: `1px solid ${lv.primary}20` }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${lv.primary}15` }}>
                    <DollarSign className="h-4 w-4" style={{ color: lv.dark }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: lv.text }}>3-sec billing</p>
                    <p className="text-xs" style={{ color: lv.textLight }}>Lightning fast</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 rounded-xl p-3 shadow-lg animate-float" style={{ animationDelay: '1s', background: lv.white, border: `1px solid ${lv.primary}20` }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${lv.primary}15` }}>
                    <BarChart3 className="h-4 w-4" style={{ color: lv.primary }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: lv.text }}>Live reports</p>
                    <p className="text-xs" style={{ color: lv.textLight }}>Updated now</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-1/3 -right-5 rounded-full px-3 py-2 shadow-lg" style={{ background: lv.primary }}>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-white" />
                  <span className="text-xs font-medium text-white">256-bit SSL</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8" style={{ color: lv.primary }} />
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section data-section="trust" className="py-12 px-6 transition-all duration-700" style={{ background: `${lv.white}90` }}>
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <ShieldCheck className="h-6 w-6" />, label: "ISO 27001 Certified" },
              { icon: <Lock className="h-6 w-6" />, label: "256-bit SSL Encryption" },
              { icon: <CreditCard className="h-6 w-6" />, label: "PCI DSS Compliant" },
              { icon: <Award className="h-6 w-6" />, label: "99.9% Uptime SLA" }
            ].map((badge, i) => (
              <div key={i} className="flex items-center justify-center gap-3 p-4 rounded-xl hover:scale-105 hover:shadow-md transition-all"
                style={{ background: lv.cardBg, backdropFilter: 'blur(10px)', border: `1px solid ${lv.primary}15` }}>
                <div style={{ color: lv.primary }}>{badge.icon}</div>
                <span className="text-sm font-medium" style={{ color: lv.text, fontFamily: 'DM Sans' }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section data-section="stats" className="py-16 px-6 relative overflow-hidden" style={{ background: lv.darkest }}>
        <div className="absolute inset-0 opacity-20"
          style={{ background: `linear-gradient(135deg, ${lv.primary}, ${lv.accent})` }} />
        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: counters.restaurants, suffix: '+', label: 'Restaurants', icon: '🍽️' },
              { value: Math.floor(counters.orders / 1000000), suffix: 'M+', label: 'Orders Processed', icon: '📋' },
              { value: counters.uptime, suffix: '%', label: 'Uptime Guaranteed', icon: '⚡' },
              { value: counters.rating, suffix: '★', label: 'Average Rating', icon: '⭐' }
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <div className="text-4xl mb-2 transform transition-transform duration-300 group-hover:scale-125">{stat.icon}</div>
                <div className="text-4xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display' }}>
                  {typeof stat.value === 'number' && stat.value % 1 !== 0 ? stat.value.toFixed(1) : stat.value}{stat.suffix}
                </div>
                <div className="text-gray-300 text-sm font-medium" style={{ fontFamily: 'DM Sans' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" data-section="features" className="py-16 px-6 relative">
        <div className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(ellipse at top, ${lv.light}, transparent 60%)` }} />
        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-xl text-sm font-semibold mb-4"
              style={{ background: `${lv.primary}15`, color: lv.primary, fontFamily: 'DM Sans' }}>
              ✦ Everything You Need
            </span>
            <h2 className="text-4xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: lv.text }}>
              Built for Indian Restaurants
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>
              Every feature crafted with the needs of Indian restaurant owners in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i}
                className="group rounded-xl p-5 transition-all duration-500 cursor-pointer"
                style={{
                  background: activeFeature === i ? lv.white : lv.cardBg,
                  border: activeFeature === i ? `2px solid ${lv.primary}` : `1px solid ${lv.primary}20`,
                  boxShadow: activeFeature === i ? `0 20px 40px ${lv.primary}20` : '0 4px 20px rgba(155,126,200,0.08)',
                  transform: activeFeature === i ? 'translateY(-6px)' : 'translateY(0)',
                  backdropFilter: 'blur(20px)',
                  animation: `fadeInUp 0.6s ease-out ${i * 0.1}s both`
                }}
                onMouseEnter={() => setActiveFeature(i)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${lv.primary}15` }}>
                  <div style={{ color: lv.primary }}>{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Playfair Display', color: lv.text }}>{feature.title}</h3>
                <p style={{ color: lv.textLight, fontFamily: 'DM Sans', lineHeight: '1.6' }}>{feature.desc}</p>
                <div className="mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: lv.primary }}>
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {features.map((_, i) => (
              <button key={i} onClick={() => setActiveFeature(i)}
                className="rounded-full transition-all duration-300"
                style={{ width: activeFeature === i ? '24px' : '8px', height: '8px', background: activeFeature === i ? lv.primary : `${lv.primary}30` }} />
            ))}
          </div>

          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: 'Playfair Display', color: lv.text }}>
              Plus Many More Features
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
                  style={{ background: lv.cardBg, backdropFilter: 'blur(10px)', border: `1px solid ${lv.primary}15` }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${lv.primary}15` }}>
                    <div style={{ color: lv.primary }}>{feature.icon}</div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: lv.text, fontFamily: 'DM Sans' }}>{feature.title}</p>
                    <p className="text-xs" style={{ color: lv.textLight }}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD SCREENSHOT ── */}
      <section data-section="screenshot" className="py-16 px-6 relative overflow-hidden" style={{ background: lv.darkest }}>
        <div className="absolute inset-0 opacity-15"
          style={{ background: `linear-gradient(135deg, ${lv.primary}, ${lv.accent})` }} />
        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display' }}>
              See It in Action
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto" style={{ fontFamily: 'DM Sans' }}>
              A clean, powerful interface your team will actually love using
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(155,126,200,0.3)]"
              style={{ border: `1px solid ${lv.primary}30` }}>
              <div className="p-3 flex items-center gap-2" style={{ background: '#3D2B5A' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-gray-400 ml-2">Dashboard — RestaurantPro</span>
              </div>
              <div className="aspect-video relative" style={{ background: lv.darkest }}>
                <img src="/Macbook-Air-localhost.png" alt="RestaurantPro Dashboard"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }} />
                <div className="absolute inset-0 items-center justify-center flex-col gap-3 hidden"
                  style={{ background: `${lv.primary}10` }}>
                  <BarChart3 className="h-12 w-12 opacity-30" style={{ color: lv.accent }} />
                  <p className="text-sm" style={{ color: lv.textLight }}>Dashboard View</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(155,126,200,0.3)]"
              style={{ border: `1px solid ${lv.primary}30` }}>
              <div className="p-3 flex items-center gap-2" style={{ background: '#3D2B5A' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-gray-400 ml-2">Tables — RestaurantPro</span>
              </div>
              <div className="aspect-video relative" style={{ background: lv.darkest }}>
                <img src="/Macbook-Air-localhost (1).png" alt="RestaurantPro Tables"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }} />
                <div className="absolute inset-0 items-center justify-center flex-col gap-3 hidden"
                  style={{ background: `${lv.primary}10` }}>
                  <Utensils className="h-12 w-12 opacity-30" style={{ color: lv.accent }} />
                  <p className="text-sm" style={{ color: lv.textLight }}>Table Management</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-10">
            <Button size="lg" onClick={() => router.push('/signup')}
              className="rounded-full px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{ background: lv.primary, color: lv.white, fontFamily: 'DM Sans' }}>
              Try It Free — No Credit Card <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" data-section="how-it-works" className="py-16 px-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-xl text-sm font-semibold mb-4"
              style={{ background: `${lv.primary}15`, color: lv.primary, fontFamily: 'DM Sans' }}>
              ✦ Simple Process
            </span>
            <h2 className="text-4xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: lv.text }}>
              Up and Running in Minutes
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>
              No IT team required. No lengthy installation. Just sign up and go.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">

            {howItWorks.map((step, i) => (
              <div key={i}
                className="relative text-center group"
                style={{ animation: `fadeInUp 0.6s ease-out ${i * 0.15}s both` }}>
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                    style={{ background: `${lv.primary}15`, border: `2px solid ${lv.primary}30` }}>
                    <div style={{ color: lv.primary }}>{step.icon}</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: lv.primary, fontFamily: 'DM Sans' }}>
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-bold mb-2 text-lg" style={{ fontFamily: 'Playfair Display', color: lv.text }}>{step.title}</h3>
                <p className="text-sm" style={{ color: lv.textLight, fontFamily: 'DM Sans', lineHeight: '1.6' }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => router.push('/signup')}
              className="rounded-full px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{ background: lv.primary, color: lv.white, fontFamily: 'DM Sans' }}>
              Get Started in 5 Minutes <Rocket className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section id="integrations" data-section="integrations" className="py-16 px-6" style={{ background: lv.light }}>
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-xl text-sm font-semibold mb-4"
              style={{ background: `${lv.primary}15`, color: lv.primary, fontFamily: 'DM Sans' }}>
              ✦ Plug & Play
            </span>
            <h2 className="text-4xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: lv.text }}>
              Seamless Integrations
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>
              Connect with payment gateways and delivery platforms you already use
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {integrations.map((integration, i) => (
              <div key={i}
                className="rounded-xl p-6 text-center transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl group cursor-pointer"
                style={{
                  background: lv.cardBg,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${lv.primary}15`,
                  animation: `fadeInUp 0.5s ease-out ${i * 0.08}s both`
                }}>
                <div className="text-4xl mb-3 transition-all duration-300 group-hover:scale-125">{integration.icon}</div>
                <p className="font-semibold text-sm" style={{ color: lv.text, fontFamily: 'DM Sans' }}>{integration.name}</p>
                <div className="mt-2 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: lv.primary }} />
                  <span className="text-xs font-medium" style={{ color: lv.primary, fontFamily: 'DM Sans' }}>Connected</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>
              <Plus className="h-3.5 w-3.5" style={{ color: lv.primary }} /> More added regularly
            </span>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section data-section="comparison" className="py-16 px-6" style={{ background: lv.darkest }}>
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Playfair Display' }}>
              Why Choose RestaurantPro?
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-300" style={{ fontFamily: 'DM Sans' }}>
              See how we stack up against the old way of doing things
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium w-1/4" style={{ fontFamily: 'DM Sans' }}>Feature</th>
                  <th className="text-center py-4 px-6 rounded-t-xl w-1/4"
                    style={{ background: `linear-gradient(135deg, ${lv.primary}, ${lv.accent})` }}>
                    <span className="text-white font-bold" style={{ fontFamily: 'Playfair Display' }}>RestaurantPro</span>
                    <span className="block text-xs text-purple-200 mt-1">Recommended ⭐</span>
                  </th>
                  <th className="text-center py-4 px-6 text-gray-400 font-medium w-1/4" style={{ fontFamily: 'DM Sans' }}>Traditional POS</th>
                  <th className="text-center py-4 px-6 text-gray-400 font-medium w-1/4" style={{ fontFamily: 'DM Sans' }}>Manual</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Order Speed", us: "3 seconds", traditional: "2–5 mins", manual: "5–10 mins" },
                  { feature: "Billing Accuracy", us: "99.9%", traditional: "95%", manual: "85%" },
                  { feature: "Cloud Backup", us: "Automatic", traditional: "Manual", manual: "None" },
                  { feature: "Real-time Reports", us: "Live", traditional: "Daily", manual: "Weekly" },
                  { feature: "Multi-device Sync", us: "Instant", traditional: "Delayed", manual: "No" },
                  { feature: "Setup Time", us: "5 mins", traditional: "2 hours", manual: "Days" },
                  { feature: "Monthly Cost", us: "₹999+", traditional: "₹5,000+", manual: "₹0 (slow)" }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-white font-medium" style={{ fontFamily: 'DM Sans' }}>{row.feature}</td>
                    <td className="py-4 px-6 text-center" style={{ background: `${lv.primary}12` }}>
                      <span className="text-green-400 font-semibold flex items-center justify-center gap-2">
                        <Check className="h-4 w-4" /> {row.us}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-400">{row.traditional}</td>
                    <td className="py-4 px-6 text-center text-gray-500">{row.manual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" data-section="testimonials" className="py-16 px-6 relative overflow-hidden"
        style={{ background: lv.lighter }}>
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full opacity-20 blur-2xl" style={{ background: lv.accent }} />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full opacity-15 blur-2xl" style={{ background: lv.primary }} />

        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-xl text-sm font-semibold mb-4"
              style={{ background: `${lv.primary}15`, color: lv.primary, fontFamily: 'DM Sans' }}>
              ✦ Real Stories
            </span>
            <h2 className="text-4xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: lv.text }}>
              Loved by 500+ Owners
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>
              Real results from restaurant owners across India
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {testimonials.map((t, i) => (
              <div key={i}
                className="rounded-xl p-5 transition-all duration-500 hover:-translate-y-1 cursor-pointer relative"
                style={{
                  background: activeTestimonial === i ? lv.white : lv.cardBg,
                  backdropFilter: 'blur(20px)',
                  boxShadow: activeTestimonial === i ? `0 20px 50px ${lv.primary}25` : `0 4px 20px ${lv.primary}10`,
                  border: activeTestimonial === i ? `2px solid ${lv.primary}` : `1px solid ${lv.primary}15`,
                  animation: `fadeInUp 0.6s ease-out ${i * 0.15}s both`
                }}
                onClick={() => setActiveTestimonial(i)}>
                <div className="absolute top-6 right-6 opacity-10">
                  <Quote className="h-10 w-10" style={{ color: lv.primary }} />
                </div>

                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" style={{ color: '#D4A853' }} />
                  ))}
                </div>
                <p className="text-base mb-6 leading-relaxed" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${lv.primary}15` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${lv.primary}, ${lv.accent})` }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ fontFamily: 'Playfair Display', color: lv.text }}>{t.name}</p>
                      <p className="text-xs" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>{t.restaurant}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                    style={{ background: `${lv.primary}15`, color: lv.primary }}>
                    {t.revenue}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className="rounded-full transition-all duration-300"
                style={{ width: activeTestimonial === i ? '24px' : '8px', height: '8px', background: activeTestimonial === i ? lv.primary : `${lv.primary}30` }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" data-section="pricing" className="py-16 px-6" style={{ background: lv.light }}>
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-xl text-sm font-semibold mb-4"
              style={{ background: `${lv.primary}15`, color: lv.primary, fontFamily: 'DM Sans' }}>
              ✦ Transparent Pricing
            </span>
            <h2 className="text-4xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: lv.text }}>
              Simple, Honest Pricing
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>
              No hidden fees. No surprises. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {pricingPlans.map((plan, i) => (
              <div key={i}
                className={`rounded-xl p-5 transition-all duration-500 hover:-translate-y-1 relative ${plan.popular ? 'md:-mt-4' : ''}`}
                style={{
                  background: plan.popular ? `linear-gradient(135deg, ${lv.primary}, ${lv.accent})` : lv.cardBg,
                  backdropFilter: 'blur(20px)',
                  boxShadow: plan.popular ? `0 24px 60px ${lv.primary}40` : `0 8px 30px ${lv.primary}10`,
                  border: plan.popular ? 'none' : `1px solid ${lv.primary}20`,
                  animation: `fadeInUp 0.6s ease-out ${i * 0.15}s both`
                }}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-lg"
                      style={{ background: '#D4A853' }}>
                      ⭐ Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-1"
                    style={{ fontFamily: 'Playfair Display', color: plan.popular ? lv.white : lv.text }}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-4xl font-bold"
                      style={{ fontFamily: 'Playfair Display', color: plan.popular ? lv.white : lv.text }}>
                      {plan.price}
                    </span>
                    <span className="text-sm" style={{ color: plan.popular ? `${lv.white}cc` : lv.textLight }}>{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2.5"
                      style={{ color: plan.popular ? lv.white : lv.textLight, fontFamily: 'DM Sans', fontSize: '14px' }}>
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0"
                        style={{ color: plan.popular ? '#D4A853' : lv.primary }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-xl py-6 text-base font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: plan.popular ? lv.white : lv.primary,
                    color: plan.popular ? lv.primary : lv.white,
                    fontFamily: 'DM Sans'
                  }}
                  onClick={() => router.push('/signup')}>
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center mt-8 text-sm" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section data-section="faq" className="py-16 px-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-xl text-sm font-semibold mb-4"
                style={{ background: `${lv.primary}15`, color: lv.primary, fontFamily: 'DM Sans' }}>
                ✦ FAQ
              </span>
              <h2 className="text-4xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: lv.text }}>
                Common Questions
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { q: "How long does setup take?", a: "Most restaurants are up and running within 5 minutes. Just sign up, add your tables and menu, and start taking orders!" },
                { q: "Is my data secure?", a: "Absolutely. We use 256-bit SSL encryption and are ISO 27001 certified. Your data is backed up automatically to the cloud every hour." },
                { q: "Can I use it on multiple devices?", a: "Yes! RestaurantPro works on any device — phones, tablets, and computers. All data syncs instantly across every device." },
                { q: "What if I need help?", a: "We offer 24/7 support via chat, email, and phone. Professional and Enterprise plans include dedicated priority support." },
                { q: "Can I cancel anytime?", a: "Yes! No contracts, no cancellation fees. You can upgrade, downgrade, or cancel whenever you want — no questions asked." }
              ].map((faq, i) => (
                <div key={i}
                  className="rounded-xl p-5 transition-all duration-300 hover:shadow-md"
                  style={{
                    background: lv.cardBg,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${lv.primary}15`,
                    animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both`
                  }}>
                  <h3 className="font-bold mb-2 flex items-center gap-2"
                    style={{ fontFamily: 'Playfair Display', color: lv.text }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: lv.primary }}>Q</span>
                    {faq.q}
                  </h3>
                  <p className="ml-8" style={{ color: lv.textLight, fontFamily: 'DM Sans', lineHeight: '1.7' }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" data-section="contact" className="py-16 px-6" style={{ background: lv.light }}>
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div style={{ animation: 'fadeInLeft 0.8s ease-out both' }}>
              <span className="inline-block px-4 py-1.5 rounded-xl text-sm font-semibold mb-6"
                style={{ background: `${lv.primary}15`, color: lv.primary, fontFamily: 'DM Sans' }}>
                ✦ Get in Touch
              </span>
              <h2 className="text-4xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: lv.text }}>
                We'd Love to Hear From You
              </h2>
              <p className="text-lg mb-10" style={{ color: lv.textLight, fontFamily: 'DM Sans', lineHeight: '1.8' }}>
                Have questions about pricing, features, or anything else? Our team is here to help.
              </p>

              <div className="space-y-5">
                {[
                  { icon: <Mail className="h-5 w-5 text-white" />, label: "Email", value: "support@restaurantpro.in" },
                  { icon: <Phone className="h-5 w-5 text-white" />, label: "Phone", value: "+91 98765 43210" },
                  { icon: <MapPin className="h-5 w-5 text-white" />, label: "Address", value: "Mumbai, Maharashtra, India" },
                  { icon: <Headphones className="h-5 w-5 text-white" />, label: "Support Hours", value: "24/7 — Always Available" }
                ].map((contact, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{ background: lv.primary }}>
                      {contact.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: lv.primary, fontFamily: 'DM Sans' }}>{contact.label}</p>
                      <p className="font-medium" style={{ color: lv.text, fontFamily: 'DM Sans' }}>{contact.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-5 rounded-xl" style={{ background: lv.cardBg, border: `1px solid ${lv.primary}20` }}>
                <p className="text-sm font-semibold mb-3" style={{ color: lv.text, fontFamily: 'DM Sans' }}>Average response time</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: `${lv.primary}20` }}>
                    <div className="h-full rounded-full" style={{ width: '85%', background: lv.primary }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: lv.primary }}>Under 2 hours</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-5 shadow-lg"
              style={{
                background: lv.cardBg, backdropFilter: 'blur(20px)',
                border: `1px solid ${lv.primary}20`,
                animation: 'fadeInRight 0.8s ease-out both'
              }}>
              <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Playfair Display', color: lv.text }}>
                Send us a Message
              </h3>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>Name</label>
                    <input type="text" placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                      style={{ borderColor: `${lv.primary}25`, background: lv.white, fontFamily: 'DM Sans', color: lv.text }}
                      onFocus={(e) => e.target.style.borderColor = lv.primary}
                      onBlur={(e) => e.target.style.borderColor = `${lv.primary}25`} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>Phone</label>
                    <input type="tel" placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                      style={{ borderColor: `${lv.primary}25`, background: lv.white, fontFamily: 'DM Sans', color: lv.text }}
                      onFocus={(e) => e.target.style.borderColor = lv.primary}
                      onBlur={(e) => e.target.style.borderColor = `${lv.primary}25`} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>Email</label>
                  <input type="email" placeholder="you@restaurant.com"
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                    style={{ borderColor: `${lv.primary}25`, background: lv.white, fontFamily: 'DM Sans', color: lv.text }}
                    onFocus={(e) => e.target.style.borderColor = lv.primary}
                    onBlur={(e) => e.target.style.borderColor = `${lv.primary}25`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>Restaurant Name</label>
                  <input type="text" placeholder="e.g. Spice Garden"
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                    style={{ borderColor: `${lv.primary}25`, background: lv.white, fontFamily: 'DM Sans', color: lv.text }}
                    onFocus={(e) => e.target.style.borderColor = lv.primary}
                    onBlur={(e) => e.target.style.borderColor = `${lv.primary}25`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: lv.textLight, fontFamily: 'DM Sans' }}>Message</label>
                  <textarea rows={4} placeholder="Tell us about your restaurant and what you need..."
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none"
                    style={{ borderColor: `${lv.primary}25`, background: lv.white, fontFamily: 'DM Sans', color: lv.text }}
                    onFocus={(e) => e.target.style.borderColor = lv.primary}
                    onBlur={(e) => e.target.style.borderColor = `${lv.primary}25`} />
                </div>
                <Button type="submit"
                  className="w-full rounded-xl py-6 text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
                  style={{ background: lv.primary, color: lv.white, fontFamily: 'DM Sans' }}>
                  Send Message <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── MOBILE APP ── */}
      <section data-section="mobile" className="py-16 px-6 relative overflow-hidden" style={{ background: lv.darkest }}>
        <div className="absolute inset-0 opacity-15"
          style={{ background: `linear-gradient(135deg, ${lv.primary}, ${lv.accent})` }} />
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-10"
          style={{ border: `2px solid ${lv.accent}` }} />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 rounded-full opacity-10"
          style={{ border: `2px solid ${lv.primary}` }} />

        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-xl text-sm font-semibold mb-6"
                style={{ background: `${lv.primary}30`, color: lv.accent, fontFamily: 'DM Sans' }}>
                ✦ Mobile App
              </span>
              <h2 className="text-4xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Playfair Display' }}>
                Manage From Anywhere
              </h2>
              <p className="text-lg mb-8 text-gray-300 max-w-lg" style={{ fontFamily: 'DM Sans', lineHeight: '1.8' }}>
                Download our mobile app and take full control of your restaurant from your pocket — whether you're on the floor or on a holiday.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: <Bell className="h-5 w-5" />, text: "Push notifications for every new order" },
                  { icon: <BarChart3 className="h-5 w-5" />, text: "Real-time revenue dashboard at a glance" },
                  { icon: <Users className="h-5 w-5" />, text: "Manage staff schedules on the go" },
                  { icon: <Shield className="h-5 w-5" />, text: "Biometric login for secure access" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${lv.primary}30` }}>
                      <div style={{ color: lv.accent }}>{item.icon}</div>
                    </div>
                    <span className="text-gray-300 text-sm" style={{ fontFamily: 'DM Sans' }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg"
                  className="rounded-full px-8 py-5 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-3"
                  style={{ background: lv.white, color: lv.darkest, fontFamily: 'DM Sans' }}>
                  <Smartphone className="h-5 w-5" />
                  <div className="text-left">
                    <p className="text-xs opacity-60">Download on the</p>
                    <p className="font-bold text-sm -mt-0.5">App Store</p>
                  </div>
                </Button>
                <Button size="lg"
                  className="rounded-full px-8 py-5 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-3"
                  style={{ background: `${lv.white}15`, color: lv.white, border: `1px solid ${lv.white}30`, fontFamily: 'DM Sans' }}>
                  <Monitor className="h-5 w-5" />
                  <div className="text-left">
                    <p className="text-xs opacity-60">Get it on</p>
                    <p className="font-bold text-sm -mt-0.5">Google Play</p>
                  </div>
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-64">
                <div className="rounded-[3rem] p-4 shadow-lg"
                  style={{ background: '#3D2B5A', border: `2px solid ${lv.primary}40` }}>
                  <div className="w-20 h-5 rounded-full mx-auto mb-3" style={{ background: '#2D1B4E' }} />
                  <div className="rounded-[2rem] overflow-hidden aspect-[9/19.5]"
                    style={{ background: lv.darkest }}>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs font-bold">🍽️ Dashboard</span>
                        <span className="text-green-400 text-xs">● Live</span>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: `${lv.primary}20` }}>
                        <p className="text-gray-400 text-xs">Today's Revenue</p>
                        <p className="text-white font-bold text-lg mt-1">₹45,200</p>
                        <p className="text-green-400 text-xs">↑ 12% vs yesterday</p>
                      </div>
                      {['Table #3 — Ready', 'Table #7 — Preparing', 'Table #1 — Served'].map((order, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="w-2 h-2 rounded-full"
                            style={{ background: i === 0 ? '#4ade80' : i === 1 ? '#facc15' : '#60a5fa' }} />
                          <span className="text-gray-300 text-xs">{order}</span>
                        </div>
                      ))}
                      <div className="pt-2">
                        <p className="text-gray-500 text-xs mb-2">This week</p>
                        <div className="flex items-end gap-1 h-10">
                          {[60, 80, 50, 90, 70, 100, 75].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t"
                              style={{ height: `${h}%`, background: i === 5 ? lv.accent : `${lv.primary}50` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-20 h-1 rounded-full mx-auto mt-3" style={{ background: `${lv.primary}50` }} />
                </div>
                <div className="absolute -right-6 top-1/3 rounded-xl p-2.5 shadow-lg"
                  style={{ background: lv.white, border: `1px solid ${lv.primary}20` }}>
                  <div className="flex items-center gap-1.5">
                    <Bell className="h-4 w-4" style={{ color: lv.primary }} />
                    <span className="text-xs font-bold" style={{ color: lv.text }}>New order!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section data-section="cta" className="py-16 px-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${lv.primary}, ${lv.accent})` }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="w-full max-w-4xl mx-auto text-center relative z-10">
          <div className="text-4xl mb-6">🚀</div>
          <h2 className="text-4xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Playfair Display' }}>
            Join 500+ Restaurants Growing
          </h2>
          <p className="text-lg mb-10 text-purple-100 max-w-xl mx-auto" style={{ fontFamily: 'DM Sans', lineHeight: '1.8' }}>
            Start your free 14-day trial today. No credit card required. Transform your restaurant operations in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/signup')}
              className="rounded-full px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg group"
              style={{ background: lv.white, color: lv.primary, fontFamily: 'DM Sans' }}>
              Get Started Free <Rocket className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login')}
              className="rounded-full px-6 py-4 text-base font-semibold border-2 transition-all duration-300 hover:scale-105"
              style={{ 
                borderColor: lv.white, 
                color: lv.white, 
                background: 'rgba(255,255,255,0.15)',
                fontFamily: 'DM Sans',
                backdropFilter: 'blur(10px)'
              }}>
              Login to Dashboard
            </Button>
          </div>
          <p className="mt-6 text-purple-200 text-sm" style={{ fontFamily: 'DM Sans' }}>
            ✓ Free for 14 days &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-16 px-6" style={{ background: `${lv.darkest}`, borderTop: `1px solid ${lv.primary}20` }}>
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🍽️</span>
                <span className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display' }}>RestaurantPro</span>
              </div>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed" style={{ fontFamily: 'DM Sans' }}>
                Complete restaurant management software trusted by 500+ restaurants across India. Built with love for Indian restaurants.
              </p>
              <div className="flex gap-2">
                <input type="email" placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${lv.primary}30`, color: 'white', fontFamily: 'DM Sans' }} />
                <Button size="sm" className="transition-all duration-300 hover:scale-105 rounded-lg px-4"
                  style={{ background: lv.primary, color: lv.white }}>
                  Subscribe
                </Button>
              </div>
              <p className="text-gray-500 text-xs mt-2" style={{ fontFamily: 'DM Sans' }}>No spam. Unsubscribe anytime.</p>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Demo', 'Updates', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Partners'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'API Docs', 'Community'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies', 'GDPR'] }
            ].map((section, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'DM Sans' }}>{section.title}</h4>
                <ul className="space-y-2.5">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-gray-400 text-sm transition-all duration-300 hover:text-white hover:pl-1"
                        style={{ fontFamily: 'DM Sans', display: 'inline-block' }}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderColor: `${lv.primary}20` }}>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'DM Sans' }}>
              © 2026 RestaurantPro. Made with ❤️ by Team Shaurya | Nexus
            </p>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'Instagram', 'YouTube'].map((social, i) => (
                <a key={i} href="#"
                  className="text-gray-500 text-sm transition-all duration-300 hover:text-white"
                  style={{ fontFamily: 'DM Sans' }}>
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── GLOBAL STYLES ── */}
      <style jsx global>{`
        html { scroll-behavior: smooth; }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${lv.lighter}; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, ${lv.primary}, ${lv.accent});
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover { background: ${lv.accent}; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }

        .animate-fadeInUp  { animation: fadeInUp  0.8s ease-out both; }
        .animate-fadeInLeft  { animation: fadeInLeft 0.8s ease-out both; }
        .animate-fadeInRight { animation: fadeInRight 0.8s ease-out both; }
        .animate-slideDown { animation: slideDown 0.3s ease-out both; }
        .animate-float     { animation: float 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}