'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { persistentUserStorage } from '@/lib/persistent-user-storage';
import { 
  ChefHat, Clock, Users, Shield, ChevronRight, Star, Utensils, BarChart3,
  Check, Mail, Phone, MapPin, Menu, X, Heart, ChevronDown, Package, Truck,
  Settings, DollarSign, ShoppingBag, Bell, Filter, SortAsc, RefreshCw, Printer,
  Lock, Zap, Globe, Award, TrendingUp, ShieldCheck, CreditCard, Headphones,
  Monitor, Smartphone, PlayCircle, HardDrive, Calendar, File, Cloud, Wifi,
  Database, MessageSquare, FileText, RefreshCcw, Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeFeature, setActiveFeature] = useState(0);
  const [counters, setCounters] = useState({ restaurants: 0, orders: 0, uptime: 0, rating: 0 });
  const [statsAnimated, setStatsAnimated] = useState(false);

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

  // Scroll progress
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

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            if (sectionId) {
              setVisibleSections(prev => new Set([...prev, sectionId]));
              if (sectionId === 'stats' && !statsAnimated) {
                setStatsAnimated(true);
                animateCounters();
              }
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, [statsAnimated]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);
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

  // Lavender color palette - simplified and elegant
  const lavender = {
    primary: '#9B7EC8',      // Main lavender
    light: '#E8E0F0',        // Light lavender background
    lighter: '#F5F0FA',      // Very light lavender
    dark: '#7B5FA8',         // Darker lavender for accents
    darkest: '#5B3F78',      // Deepest lavender
    accent: '#C4A7E0',       // Soft accent lavender
    text: '#2D1B4E',         // Dark purple text
    textLight: '#6B5B7B',    // Light purple text
    white: '#FFFFFF',
    cardBg: 'rgba(255, 255, 255, 0.85)',
  };

  const features = [
    { 
      icon: <Utensils className="h-8 w-8" />, 
      title: "Smart Table Management", 
      desc: "Visual floor plan with real-time status tracking, reservations, and waitlist management",
    },
    { 
      icon: <Zap className="h-8 w-8" />, 
      title: "Lightning-Fast Billing", 
      desc: "Process bills in 3 seconds with split bills, discounts, and multiple payment options",
    },
    { 
      icon: <Package className="h-8 w-8" />, 
      title: "KOT & Order Tracking", 
      desc: "Kitchen display system with real-time order status from table to plate",
    },
    { 
      icon: <BarChart3 className="h-8 w-8" />, 
      title: "Real-Time Analytics", 
      desc: "Auto-generated reports with actionable insights to boost your revenue",
    },
    { 
      icon: <Users className="h-8 w-8" />, 
      title: "Staff Management", 
      desc: "Role-based permissions, shift tracking, and performance monitoring",
    },
    { 
      icon: <Cloud className="h-8 w-8" />, 
      title: "Cloud Backup", 
      desc: "Automatic cloud sync with access from any device, anywhere",
    }
  ];

  const newFeatures = [
    { icon: <Wifi className="h-6 w-6" />, title: "Offline Mode", desc: "Works without internet" },
    { icon: <Printer className="h-6 w-6" />, title: "Print Integration", desc: "Thermal printer support" },
    { icon: <Bell className="h-6 w-6" />, title: "Smart Notifications", desc: "Real-time alerts" },
    { icon: <Database className="h-6 w-6" />, title: "Inventory Sync", desc: "Auto stock updates" },
    { icon: <Calendar className="h-6 w-6" />, title: "Reservation System", desc: "Online bookings" },
    { icon: <MessageSquare className="h-6 w-6" />, title: "Customer Feedback", desc: "In-app reviews" },
    { icon: <FileText className="h-6 w-6" />, title: "GST Compliance", desc: "Auto tax calculation" },
    { icon: <RefreshCcw className="h-6 w-6" />, title: "Multi-Outlet", desc: "Manage all branches" }
  ];

  const integrations = [
    { name: "Google Pay", icon: "💳" },
    { name: "PhonePe", icon: "📱" },
    { name: "Paytm", icon: "💰" },
    { name: "Razorpay", icon: "🔐" },
    { name: "Swiggy", icon: "🛵" },
    { name: "Zomato", icon: "🍕" },
    { name: "WhatsApp", icon: "💬" },
    { name: "SMS Gateway", icon: "📲" }
  ];

  const testimonials = [
    { 
      name: "Priya Sharma", 
      restaurant: "Spice Route, Mumbai", 
      quote: "RestaurantPro transformed our billing speed. We process 3x more orders during peak hours now!", 
      avatar: "PS", 
      rating: 5,
      revenue: "+45% Revenue"
    },
    { 
      name: "Rahul Mehta", 
      restaurant: "Spice Garden, Delhi", 
      quote: "Real-time analytics helped us identify best sellers and optimize the menu perfectly!", 
      avatar: "RM", 
      rating: 5,
      revenue: "+32% Efficiency"
    },
    { 
      name: "Anita Patel", 
      restaurant: "The Coastal Kitchen, Pune", 
      quote: "KOT tracking eliminated kitchen chaos. Order accuracy is now at 99%!", 
      avatar: "AP", 
      rating: 5,
      revenue: "99% Accuracy"
    }
  ];

  const pricingPlans = [
    { 
      name: "Starter", 
      price: "₹999", 
      period: "/mo", 
      features: ["Up to 5 tables", "Basic billing", "Daily reports", "Email support", "Mobile app"], 
      popular: false,
      cta: "Start Free Trial"
    },
    { 
      name: "Professional", 
      price: "₹2,499", 
      period: "/mo", 
      features: ["Up to 20 tables", "Advanced analytics", "KOT system", "Priority support", "Staff management", "Inventory tracking"], 
      popular: true,
      cta: "Start Free Trial"
    },
    { 
      name: "Enterprise", 
      price: "₹4,999", 
      period: "/mo", 
      features: ["Unlimited tables", "Custom integrations", "Dedicated manager", "24/7 support", "API access", "Multi-location"], 
      popular: false,
      cta: "Contact Sales"
    }
  ];

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: lavender.lighter }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: lavender.primary }}></div>
          <p style={{ color: lavender.text, fontFamily: 'DM Sans, sans-serif' }}>Loading RestaurantPro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: lavender.lighter }}>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60]" style={{ 
        background: `linear-gradient(90deg, ${lavender.primary} ${scrollProgress}%, transparent ${scrollProgress}%)`,
        transition: 'background 0.1s ease-out'
      }}></div>

      {/* Sticky Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl shadow-lg py-2' : 'py-4'}`} 
              style={{ background: scrolled ? `${lavender.lighter}ee` : 'transparent' }}>
        <nav className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🍽️</span>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: lavender.text }}>RestaurantPro</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse" 
                    style={{ background: `${lavender.primary}20`, color: lavender.primary }}>PRO</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'Integrations', 'Pricing', 'Testimonials', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} 
                   className="text-sm font-medium transition-all duration-300 hover:opacity-80 relative group"
                   style={{ fontFamily: 'DM Sans, sans-serif', color: lavender.text }}>
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ background: lavender.primary }}></span>
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/login')} 
                      className="transition-all duration-300 hover:scale-105" 
                      style={{ color: lavender.text, fontFamily: 'DM Sans' }}>
                Login
              </Button>
              <Button onClick={() => router.push('/signup')} 
                      className="rounded-full px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg" 
                      style={{ background: lavender.primary, color: lavender.white, fontFamily: 'DM Sans' }}>
                Get Started Free <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden transition-transform duration-300 hover:scale-110" 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" style={{ color: lavender.text }} /> : <Menu className="h-6 w-6" style={{ color: lavender.text }} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4 border-t pt-4 animate-slideDown" style={{ borderColor: `${lavender.primary}30` }}>
              {['Features', 'Integrations', 'Pricing', 'Testimonials', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} 
                   className="block text-sm font-medium py-2 transition-colors duration-300"
                   style={{ color: lavender.text, fontFamily: 'DM Sans' }}
                   onClick={() => setMobileMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t" style={{ borderColor: `${lavender.primary}30` }}>
                <Button variant="outline" onClick={() => router.push('/login')} 
                        className="transition-all duration-300" 
                        style={{ borderColor: lavender.primary, color: lavender.primary }}>
                  Login
                </Button>
                <Button onClick={() => router.push('/signup')} 
                        className="transition-all duration-300" 
                        style={{ background: lavender.primary, color: lavender.white }}>
                  Get Started Free
                </Button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden min-h-screen flex items-center">
        {/* Subtle Lavender Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-20 blur-3xl" 
               style={{ background: `radial-gradient(circle, ${lavender.accent}, transparent)` }}></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl" 
               style={{ background: `radial-gradient(circle, ${lavender.primary}, transparent)` }}></div>
          <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl" 
               style={{ background: `radial-gradient(circle, ${lavender.light}, transparent)` }}></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left animate-fadeInUp">
              <div className="inline-flex items-center px-4 py-2 rounded-full mb-6" 
                   style={{ background: `${lavender.primary}15`, border: `1px solid ${lavender.primary}30` }}>
                <Star className="h-4 w-4 mr-2" style={{ color: lavender.dark }} />
                <span className="text-sm font-medium" style={{ color: lavender.primary, fontFamily: 'DM Sans' }}>✦ Trusted by 500+ Restaurants</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight" 
                  style={{ fontFamily: 'Playfair Display, serif', color: lavender.text }}>
                Run Your Restaurant Like a{' '}
                <span className="relative inline-block">
                  <span style={{ color: lavender.primary }}>5-Star</span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8">
                    <path d="M0 6 Q50 0 100 6 T200 6" stroke={lavender.accent} strokeWidth="3" fill="none"/>
                  </svg>
                </span>
                {' '}Operation
              </h1>
              
              <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0" 
                 style={{ color: lavender.textLight, fontFamily: 'DM Sans', lineHeight: '1.8' }}>
                RestaurantPro handles billing, tables, orders, and analytics — focus on food, not paperwork.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button size="lg" onClick={() => router.push('/signup')}
                        className="rounded-full px-8 py-6 text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 group"
                        style={{ background: lavender.primary, color: lavender.white, fontFamily: 'DM Sans' }}>
                  🚀 Start Free Trial
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline"
                        className="rounded-full px-8 py-6 text-lg border-2 transition-all duration-300 hover:scale-105"
                        style={{ borderColor: lavender.primary, color: lavender.primary, fontFamily: 'DM Sans' }}>
                  <PlayCircle className="mr-2 h-5 w-5" /> Watch Demo
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm" 
                   style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>
                <span className="flex items-center"><Check className="h-4 w-4 mr-1" style={{ color: lavender.primary }} /> No credit card</span>
                <span className="flex items-center"><Check className="h-4 w-4 mr-1" style={{ color: lavender.primary }} /> 5 min setup</span>
                <span className="flex items-center"><Check className="h-4 w-4 mr-1" style={{ color: lavender.primary }} /> 14-day trial</span>
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-3">
                  {['PS', 'RM', 'AP', 'VK', 'SD'].map((initials, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 hover:scale-110 hover:z-10"
                         style={{ background: [lavender.primary, lavender.dark, lavender.accent, lavender.darkest, lavender.light][i], color: lavender.white }}>
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="text-sm" style={{ color: lavender.textLight }}>Join 500+ owners</span>
              </div>
            </div>

            {/* Right - Dashboard Mockup */}
            <div className="relative animate-fadeInRight">
              <div className="rounded-2xl p-6 shadow-2xl relative overflow-hidden" 
                   style={{ background: lavender.darkest, border: `1px solid ${lavender.primary}30` }}>
                <div className="absolute inset-0 opacity-10" 
                     style={{ background: `linear-gradient(135deg, ${lavender.primary}, transparent)` }}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🍽️</span>
                      <span className="font-bold text-white" style={{ fontFamily: 'Playfair Display' }}>Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      <span className="text-green-400 text-sm" style={{ fontFamily: 'DM Sans' }}>● Live</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'Orders', value: '247', color: lavender.accent, icon: '📋' },
                      { label: 'Revenue', value: '₹45K', color: '#C4A7E0', icon: '💰' },
                      { label: 'Tables', value: '18', color: '#B8A0D0', icon: '🍽️' }
                    ].map((stat, i) => (
                      <div key={i} className="rounded-xl p-4 transition-all duration-300 hover:scale-105" 
                           style={{ 
                             background: `${lavender.primary}15`, 
                             border: `1px solid ${lavender.primary}20`
                           }}>
                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                          <span>{stat.icon}</span> {stat.label}
                        </p>
                        <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Recent Orders</p>
                    {[
                      { table: 'Table #5', item: 'Butter Chicken', amount: '₹1,250', status: 'Preparing' },
                      { table: 'Table #2', item: 'Pasta Alfredo', amount: '₹890', status: 'Ready' },
                      { table: 'Table #8', item: 'Pizza', amount: '₹1,100', status: 'Served' }
                    ].map((order, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:translate-x-2" 
                           style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: lavender.primary }}>
                            <Utensils className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{order.table}</p>
                            <p className="text-gray-400 text-xs">{order.item}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-semibold block">{order.amount}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === 'Ready' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'Preparing' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -bottom-4 -left-4 rounded-xl p-3 shadow-lg backdrop-blur-sm" 
                   style={{ background: `${lavender.white}ee`, border: `1px solid ${lavender.primary}20` }}>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" style={{ color: lavender.dark }} />
                  <span className="text-sm font-medium" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>3 sec billing</span>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 rounded-xl p-3 shadow-lg backdrop-blur-sm" 
                   style={{ background: `${lavender.white}ee`, border: `1px solid ${lavender.primary}20` }}>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" style={{ color: lavender.primary }} />
                  <span className="text-sm font-medium" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>Live reports</span>
                </div>
              </div>

              <div className="absolute bottom-1/3 -right-6 rounded-full px-3 py-2 shadow-lg" 
                   style={{ background: lavender.primary }}>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-white" />
                  <span className="text-xs font-medium text-white" style={{ fontFamily: 'DM Sans' }}>256-bit SSL</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8" style={{ color: lavender.primary }} />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section data-section="trust" className="py-12 px-6 transition-all duration-1000" 
               style={{ 
                 background: `${lavender.white}80`,
                 opacity: visibleSections.has('trust') ? 1 : 0,
                 transform: visibleSections.has('trust') ? 'translateY(0)' : 'translateY(30px)'
               }}>
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <ShieldCheck className="h-8 w-8" />, label: "ISO 27001 Certified" },
              { icon: <Lock className="h-8 w-8" />, label: "256-bit SSL Encryption" },
              { icon: <CreditCard className="h-8 w-8" />, label: "PCI DSS Compliant" },
              { icon: <Award className="h-8 w-8" />, label: "99.9% Uptime SLA" }
            ].map((badge, i) => (
              <div key={i} className="flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                   style={{ 
                     background: lavender.cardBg, 
                     backdropFilter: 'blur(10px)',
                   }}>
                <div style={{ color: lavender.primary }}>{badge.icon}</div>
                <span className="text-sm font-medium" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section data-section="stats" className="py-20 px-6 relative overflow-hidden" style={{ background: lavender.darkest }}>
        <div className="absolute inset-0 opacity-20" 
             style={{ background: `linear-gradient(135deg, ${lavender.primary}, ${lavender.accent})` }}></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: counters.restaurants, suffix: '+', label: 'Restaurants', icon: '🍽️' },
              { value: Math.floor(counters.orders / 1000000), suffix: 'M+', label: 'Orders Processed', icon: '📋' },
              { value: counters.uptime, suffix: '%', label: 'Uptime', icon: '⚡' },
              { value: counters.rating, suffix: '★', label: 'Rating', icon: '⭐' }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl mb-2 transform transition-transform duration-300 group-hover:scale-125">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display' }}>
                  {typeof stat.value === 'number' && stat.value % 1 !== 0 ? stat.value.toFixed(1) : stat.value}{stat.suffix}
                </div>
                <div className="text-gray-300 font-medium" style={{ fontFamily: 'DM Sans' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" data-section="features" className="py-20 px-6 relative">
        <div className="absolute inset-0 opacity-20" 
             style={{ background: `radial-gradient(ellipse at top, ${lavender.light}, transparent 50%)` }}></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: lavender.text }}>
              Everything Your Restaurant Needs
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>
              Powerful features to streamline every aspect of your operations
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} 
                   className={`group rounded-2xl p-8 transition-all duration-500 cursor-pointer ${
                     visibleSections.has('features') ? 'animate-fadeInUp' : 'opacity-0'
                   }`}
                   style={{ 
                     background: activeFeature === i ? lavender.white : lavender.cardBg, 
                     backdropFilter: 'blur(20px)',
                     border: activeFeature === i ? `2px solid ${lavender.primary}` : `1px solid ${lavender.primary}20`,
                     boxShadow: activeFeature === i ? `0 20px 40px ${lavender.primary}20` : '0 4px 20px rgba(155, 126, 200, 0.1)',
                     animationDelay: `${i * 0.1}s`,
                     transform: activeFeature === i ? 'translateY(-8px)' : 'translateY(0)'
                   }}
                   onMouseEnter={() => setActiveFeature(i)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                       style={{ background: `${lavender.primary}15` }}>
                    <div style={{ color: lavender.primary }}>{feature.icon}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Playfair Display', color: lavender.text }}>{feature.title}</h3>
                <p style={{ color: lavender.textLight, fontFamily: 'DM Sans', lineHeight: '1.6' }}>{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Additional Features Grid */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: 'Playfair Display', color: lavender.text }}>
              Plus Many More Features
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                     style={{ background: lavender.cardBg, backdropFilter: 'blur(10px)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${lavender.primary}15` }}>
                    <div style={{ color: lavender.primary }}>{feature.icon}</div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>{feature.title}</p>
                    <p className="text-xs" style={{ color: lavender.textLight }}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" data-section="integrations" className="py-20 px-6 relative overflow-hidden"
               style={{ background: lavender.light }}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: lavender.text }}>
              Seamless Integrations
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>
              Connect with your favorite payment gateways and delivery platforms
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration, i) => (
              <div key={i} 
                   className={`rounded-2xl p-6 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${
                     visibleSections.has('integrations') ? 'animate-fadeInUp' : 'opacity-0'
                   }`}
                   style={{ 
                     background: lavender.cardBg, 
                     backdropFilter: 'blur(20px)',
                     border: `1px solid ${lavender.primary}15`,
                     animationDelay: `${i * 0.1}s`
                   }}>
                <div className="text-4xl mb-3">{integration.icon}</div>
                <p className="font-semibold" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>{integration.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section data-section="comparison" className="py-20 px-6" style={{ background: lavender.darkest }}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'Playfair Display' }}>
              Why Choose RestaurantPro
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-300" style={{ fontFamily: 'DM Sans' }}>
              See how we compare to traditional systems
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium" style={{ fontFamily: 'DM Sans' }}>Feature</th>
                  <th className="text-center py-4 px-6 rounded-t-xl" style={{ background: `linear-gradient(135deg, ${lavender.primary}, ${lavender.accent})` }}>
                    <span className="text-white font-bold" style={{ fontFamily: 'Playfair Display' }}>RestaurantPro</span>
                    <span className="block text-xs text-purple-200 mt-1">Recommended</span>
                  </th>
                  <th className="text-center py-4 px-6 text-gray-400 font-medium" style={{ fontFamily: 'DM Sans' }}>Traditional POS</th>
                  <th className="text-center py-4 px-6 text-gray-400 font-medium" style={{ fontFamily: 'DM Sans' }}>Manual</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Order Speed", us: "3 seconds", traditional: "2-5 mins", manual: "5-10 mins" },
                  { feature: "Billing Accuracy", us: "99.9%", traditional: "95%", manual: "85%" },
                  { feature: "Cloud Backup", us: "Auto", traditional: "Manual", manual: "None" },
                  { feature: "Real-time Reports", us: "Live", traditional: "Daily", manual: "Weekly" },
                  { feature: "Multi-device Sync", us: "Instant", traditional: "Delayed", manual: "No" },
                  { feature: "Setup Time", us: "5 mins", traditional: "2 hours", manual: "Days" },
                  { feature: "Monthly Cost", us: "₹999+", traditional: "₹5000+", manual: "₹0 (slow)" }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-4 px-6 text-white font-medium" style={{ fontFamily: 'DM Sans' }}>{row.feature}</td>
                    <td className="py-4 px-6 text-center" style={{ background: `${lavender.primary}15` }}>
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

      {/* Testimonials */}
      <section id="testimonials" data-section="testimonials" className="py-20 px-6 relative overflow-hidden"
               style={{ background: lavender.lighter }}>
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full opacity-15 blur-3xl" 
             style={{ background: lavender.accent }}></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full opacity-15 blur-3xl" 
             style={{ background: lavender.primary }}></div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: lavender.text }}>
              Loved by 500+ Owners
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>
              Real stories from restaurant owners across India
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial, i) => (
              <div key={i} 
                   className={`rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 ${
                     visibleSections.has('testimonials') ? 'animate-fadeInUp' : 'opacity-0'
                   }`}
                   style={{ 
                     background: lavender.cardBg, 
                     backdropFilter: 'blur(20px)',
                     boxShadow: `0 10px 40px ${lavender.primary}15`,
                     border: `1px solid ${lavender.primary}15`,
                     animationDelay: `${i * 0.15}s`
                   }}>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-current" style={{ color: '#D4A853' }} />
                  ))}
                </div>
                <p className="text-lg mb-6 italic" style={{ color: lavender.textLight, fontFamily: 'DM Sans', lineHeight: '1.7' }}>
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                         style={{ background: `linear-gradient(135deg, ${lavender.primary}, ${lavender.accent})` }}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold" style={{ fontFamily: 'Playfair Display', color: lavender.text }}>{testimonial.name}</p>
                      <p className="text-sm" style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>{testimonial.restaurant}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: `${lavender.primary}15`, color: lavender.primary }}>
                    {testimonial.revenue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" data-section="pricing" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: lavender.text }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: lavender.textLight, fontFamily: 'DM Sans' }}>
              Choose the plan that fits your restaurant
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div key={i} 
                   className={`rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 relative ${
                     plan.popular ? 'transform scale-105' : ''
                   } ${visibleSections.has('pricing') ? 'animate-fadeInUp' : 'opacity-0'}`}
                   style={{ 
                     background: plan.popular 
                       ? `linear-gradient(135deg, ${lavender.primary}, ${lavender.accent})` 
                       : lavender.cardBg,
                     backdropFilter: 'blur(20px)',
                     boxShadow: plan.popular 
                       ? `0 20px 60px ${lavender.primary}40` 
                       : `0 10px 40px ${lavender.primary}15`,
                     border: plan.popular ? 'none' : `1px solid ${lavender.primary}20`,
                     animationDelay: `${i * 0.15}s`
                   }}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-sm font-bold text-white shadow-lg"
                          style={{ background: '#D4A853' }}>
                      ⭐ Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2" 
                    style={{ fontFamily: 'Playfair Display', color: plan.popular ? lavender.white : lavender.text }}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold" 
                        style={{ fontFamily: 'Playfair Display', color: plan.popular ? lavender.white : lavender.text }}>
                    {plan.price}
                  </span>
                  <span style={{ color: plan.popular ? `${lavender.white}cc` : lavender.textLight }}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2" 
                        style={{ color: plan.popular ? lavender.white : lavender.textLight, fontFamily: 'DM Sans' }}>
                      <Check className="h-4 w-4" style={{ color: plan.popular ? '#D4A853' : lavender.primary }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-full py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
                        style={{ 
                          background: plan.popular ? lavender.white : lavender.primary,
                          color: plan.popular ? lavender.primary : lavender.white,
                          fontFamily: 'DM Sans'
                        }}
                        onClick={() => router.push('/signup')}>
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section data-section="faq" className="py-20 px-6" style={{ background: lavender.light }}>
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: lavender.text }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "How long does setup take?", a: "Most restaurants are up and running within 5 minutes. Just sign up, add your tables, and start taking orders!" },
              { q: "Is my data secure?", a: "Absolutely! We use 256-bit SSL encryption and are ISO 27001 certified. Your data is backed up automatically." },
              { q: "Can I use it on multiple devices?", a: "Yes! RestaurantPro works on any device - phones, tablets, computers. All data syncs instantly." },
              { q: "What if I need help?", a: "We offer 24/7 support via chat, email, and phone. Professional plan includes priority support." },
              { q: "Can I cancel anytime?", a: "Yes! No contracts, no cancellation fees. You can upgrade, downgrade, or cancel whenever you want." }
            ].map((faq, i) => (
              <div key={i} className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                visibleSections.has('faq') ? 'animate-fadeInUp' : 'opacity-0'
              }`}
                   style={{ 
                     background: lavender.cardBg, 
                     backdropFilter: 'blur(10px)',
                     animationDelay: `${i * 0.1}s`
                   }}>
                <h3 className="font-bold mb-2" style={{ fontFamily: 'Playfair Display', color: lavender.text }}>{faq.q}</h3>
                <p style={{ color: lavender.textLight, fontFamily: 'DM Sans', lineHeight: '1.6' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" data-section="contact" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className={visibleSections.has('contact') ? 'animate-fadeInLeft' : 'opacity-0'}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Playfair Display', color: lavender.text }}>
                Get in Touch
              </h2>
              <p className="text-lg mb-8" style={{ color: lavender.textLight, fontFamily: 'DM Sans', lineHeight: '1.8' }}>
                Have questions? We'd love to hear from you.
              </p>

              <div className="space-y-6">
                {[
                  { icon: <Mail className="h-5 w-5 text-white" />, label: "Email", value: "support@restaurantpro.in" },
                  { icon: <Phone className="h-5 w-5 text-white" />, label: "Phone", value: "+91 98765 43210" },
                  { icon: <MapPin className="h-5 w-5 text-white" />, label: "Address", value: "Mumbai, Maharashtra, India" },
                  { icon: <Headphones className="h-5 w-5 text-white" />, label: "Support", value: "24/7 Available" }
                ].map((contact, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: lavender.primary }}>
                      {contact.icon}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>{contact.label}</p>
                      <p style={{ color: lavender.textLight }}>{contact.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl p-8 shadow-xl ${visibleSections.has('contact') ? 'animate-fadeInRight' : 'opacity-0'}`} 
                 style={{ background: lavender.cardBg, backdropFilter: 'blur(20px)' }}>
              <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Playfair Display', color: lavender.text }}>
                Send us a Message
              </h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>Name</label>
                    <input type="text" placeholder="Your name" 
                           className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02]"
                           style={{ borderColor: `${lavender.primary}30`, background: lavender.white, fontFamily: 'DM Sans' }}
                           onFocus={(e) => e.target.style.borderColor = lavender.primary}
                           onBlur={(e) => e.target.style.borderColor = `${lavender.primary}30`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>Phone</label>
                    <input type="tel" placeholder="+91 98765 43210" 
                           className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02]"
                           style={{ borderColor: `${lavender.primary}30`, background: lavender.white, fontFamily: 'DM Sans' }}
                           onFocus={(e) => e.target.style.borderColor = lavender.primary}
                           onBlur={(e) => e.target.style.borderColor = `${lavender.primary}30`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>Email</label>
                  <input type="email" placeholder="you@example.com" 
                         className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02]"
                         style={{ borderColor: `${lavender.primary}30`, background: lavender.white, fontFamily: 'DM Sans' }}
                         onFocus={(e) => e.target.style.borderColor = lavender.primary}
                         onBlur={(e) => e.target.style.borderColor = `${lavender.primary}30`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>Restaurant Name</label>
                  <input type="text" placeholder="Your restaurant" 
                         className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-[1.02]"
                         style={{ borderColor: `${lavender.primary}30`, background: lavender.white, fontFamily: 'DM Sans' }}
                         onFocus={(e) => e.target.style.borderColor = lavender.primary}
                         onBlur={(e) => e.target.style.borderColor = `${lavender.primary}30`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: lavender.text, fontFamily: 'DM Sans' }}>Message</label>
                  <textarea rows={4} placeholder="Tell us about your restaurant..." 
                            className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none focus:scale-[1.02]"
                            style={{ borderColor: `${lavender.primary}30`, background: lavender.white, fontFamily: 'DM Sans' }}
                            onFocus={(e) => e.target.style.borderColor = lavender.primary}
                            onBlur={(e) => e.target.style.borderColor = `${lavender.primary}30`}></textarea>
                </div>
                <Button type="submit" 
                        className="w-full rounded-xl py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                        style={{ background: lavender.primary, color: lavender.white, fontFamily: 'DM Sans' }}>
                  Send Message <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section data-section="mobile" className="py-20 px-6 relative overflow-hidden" style={{ background: lavender.darkest }}>
        <div className="absolute inset-0 opacity-10" 
             style={{ background: `linear-gradient(135deg, ${lavender.primary}, ${lavender.accent})` }}></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'Playfair Display' }}>
            Take It With You
          </h2>
          <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto" style={{ fontFamily: 'DM Sans' }}>
            Download our mobile app and manage your restaurant from anywhere
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline"
                    className="rounded-full px-8 py-6 text-lg border-2 transition-all duration-300 hover:scale-105 hover:bg-white/10"
                    style={{ borderColor: lavender.white, color: lavender.white, fontFamily: 'DM Sans' }}>
              <Smartphone className="mr-2 h-5 w-5" /> iOS App
            </Button>
            <Button size="lg" variant="outline"
                    className="rounded-full px-8 py-6 text-lg border-2 transition-all duration-300 hover:scale-105 hover:bg-white/10"
                    style={{ borderColor: lavender.white, color: lavender.white, fontFamily: 'DM Sans' }}>
              <Monitor className="mr-2 h-5 w-5" /> Android App
            </Button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section data-section="cta" className="py-20 px-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${lavender.primary}, ${lavender.accent})` }}>
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'Playfair Display' }}>
            Join 500+ Restaurants Growing
          </h2>
          <p className="text-lg mb-8 text-purple-100 max-w-2xl mx-auto" style={{ fontFamily: 'DM Sans' }}>
            Start your free trial today and transform your restaurant operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/signup')}
                    className="rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
                    style={{ background: lavender.white, color: lavender.primary, fontFamily: 'DM Sans' }}>
              Get Started Free <Rocket className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login')}
                    className="rounded-full px-8 py-6 text-lg border-2 transition-all duration-300 hover:scale-105 hover:bg-white/10"
                    style={{ borderColor: lavender.white, color: lavender.white, fontFamily: 'DM Sans' }}>
              Login to Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{ background: `${lavender.darkest}ee`, borderColor: `${lavender.primary}30` }}>
        <div className="container mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🍽️</span>
                <span className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display' }}>RestaurantPro</span>
              </div>
              <p className="text-gray-400 mb-4" style={{ fontFamily: 'DM Sans', lineHeight: '1.6' }}>
                Complete restaurant management trusted by 500+ restaurants across India.
              </p>
              <div className="flex gap-2">
                <input type="email" placeholder="Enter your email" 
                       className="flex-1 px-4 py-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:scale-[1.02]"
                       style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${lavender.primary}30`, color: 'white', fontFamily: 'DM Sans' }} />
                <Button size="sm" className="transition-all duration-300 hover:scale-105" style={{ background: lavender.primary, color: lavender.white }}>Subscribe</Button>
              </div>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Demo', 'Updates'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'API Docs'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] }
            ].map((section, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold mb-4" style={{ fontFamily: 'DM Sans' }}>{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-gray-400 text-sm transition-colors duration-300 hover:text-white" style={{ fontFamily: 'DM Sans' }}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center" style={{ borderColor: `${lavender.primary}30` }}>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'DM Sans' }}>
              © 2026 RestaurantPro. Made with ❤️ by Team Shaurya | Nexus
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              {['Twitter', 'LinkedIn', 'Instagram', 'YouTube'].map((social, i) => (
                <a key={i} href="#" className="text-gray-400 transition-colors duration-300 hover:text-white hover:scale-110">
                  <span className="text-sm">{social}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS Animations */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${lavender.lighter};
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, ${lavender.primary}, ${lavender.accent});
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${lavender.accent};
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s ease-out forwards;
        }

        .animate-fadeInRight {
          animation: fadeInRight 0.8s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Smooth section transitions */
        section {
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        /* Card hover effects */
        .hover-card {
          transition: all 0.3s ease;
        }

        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(155, 126, 200, 0.15);
        }
      `}</style>
    </div>
  );
}