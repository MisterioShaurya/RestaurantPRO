'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { persistentUserStorage } from '@/lib/persistent-user-storage';
import { 
  ChefHat, Clock, Users, Shield, ChevronRight, Star, Utensils, BarChart3,
  Check, Mail, Phone, MapPin, Menu, X, Heart, ChevronDown, Package, Truck,
  Settings, DollarSign, ShoppingBag, Bell, Filter, SortAsc, RefreshCw, Printer,
  Lock, Zap, Globe, Award, TrendingUp, ShieldCheck, CreditCard, Headphones,
  Monitor, Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counters, setCounters] = useState({ restaurants: 0, orders: 0, uptime: 0, rating: 0 });
  const [activeStep, setActiveStep] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const routerInitialized = useRef(false);

  useEffect(() => {
    routerInitialized.current = true;
    
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentUser = persistentUserStorage.getCurrentUser();
      const systemLocked = persistentUserStorage.isLocked();
      
      if (currentUser && !systemLocked && routerInitialized.current) {
        router.push('/dashboard');
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsVisible) {
          setStatsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [statsVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-step') || '0');
            setActiveStep((prev) => Math.max(prev, index));
          }
        });
      },
      { threshold: 0.5 }
    );

    const stepElements = document.querySelectorAll('[data-step]');
    stepElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
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
      setCounters({
        restaurants: Math.round(targets.restaurants * progress),
        orders: Math.round(targets.orders * progress),
        uptime: parseFloat((targets.uptime * progress).toFixed(1)),
        rating: parseFloat((targets.rating * progress).toFixed(1))
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F3F1FF 0%, #E8E3FF 50%, #D4CEFF 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#7C6FCD' }}></div>
          <p style={{ color: '#1A1535', fontFamily: 'DM Sans, sans-serif' }}>Loading RestaurantPro...</p>
        </div>
      </div>
    );
  }

  const features = [
    { icon: <Utensils className="h-8 w-8" />, title: "Smart Table Management", desc: "Visual floor plan, reservations, real-time status tracking", badge: "Popular" },
    { icon: <DollarSign className="h-8 w-8" />, title: "Lightning-Fast Billing", desc: "Split bills, discounts, UPI/cash/card in seconds", badge: "Fast" },
    { icon: <Package className="h-8 w-8" />, title: "Order & KOT Tracking", desc: "Kitchen display with order status from table to plate", badge: "Essential" },
    { icon: <BarChart3 className="h-8 w-8" />, title: "Real-Time Analytics", desc: "Auto-generated reports with actionable insights", badge: "Smart" },
    { icon: <Users className="h-8 w-8" />, title: "Staff Management", desc: "Permissions, shift tracking, performance monitoring", badge: "Secure" },
    { icon: <Shield className="h-8 w-8" />, title: "Cloud Backup", desc: "Automatic backup, access from any device", badge: "Reliable" }
  ];

  const steps = [
    { num: "01", icon: <Globe className="h-6 w-6" />, name: "Visit Site", desc: "Go to restaurantpro.com" },
    { num: "02", icon: <Zap className="h-6 w-6" />, name: "Get Started", desc: "Click Get Started Free" },
    { num: "03", icon: <Users className="h-6 w-6" />, name: "Create Account", desc: "Fill in your details" },
    { num: "04", icon: <Settings className="h-6 w-6" />, name: "Workspace Ready", desc: "Dashboard created" },
    { num: "05", icon: <Utensils className="h-6 w-6" />, name: "Setup Tables", desc: "Initialize floor plan" },
    { num: "06", icon: <Menu className="h-6 w-6" />, name: "Add Menu", desc: "Upload your dishes" },
    { num: "07", icon: <ShoppingBag className="h-6 w-6" />, name: "Start Billing", desc: "Process first order" },
    { num: "08", icon: <TrendingUp className="h-6 w-6" />, name: "Auto Reports", desc: "Analytics update live" }
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

  const comparisonFeatures = [
    { feature: "Order Speed", us: "3 seconds", traditional: "2-5 mins", manual: "5-10 mins" },
    { feature: "Billing Accuracy", us: "99.9%", traditional: "95%", manual: "85%" },
    { feature: "Cloud Backup", us: "Auto", traditional: "Manual", manual: "None" },
    { feature: "Real-time Reports", us: "Live", traditional: "Daily", manual: "Weekly" },
    { feature: "Multi-device Sync", us: "Instant", traditional: "Delayed", manual: "No" },
    { feature: "Setup Time", us: "5 mins", traditional: "2 hours", manual: "Days" },
    { feature: "Monthly Cost", us: "₹999+", traditional: "₹5000+", manual: "₹0 (slow)" }
  ];

  const trustBadges = [
    { icon: <ShieldCheck className="h-8 w-8" />, label: "ISO 27001 Certified" },
    { icon: <Lock className="h-8 w-8" />, label: "256-bit SSL Encryption" },
    { icon: <CreditCard className="h-8 w-8" />, label: "PCI DSS Compliant" },
    { icon: <Award className="h-8 w-8" />, label: "99.9% Uptime SLA" }
  ];

  const clientLogos = [
    "Spice Route", "Spice Garden", "Coastal Kitchen", "Punjab Dhaba", 
    "South Corner", "Mumbai Tadka", "Delhi Darbar", "Chennai Express"
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F3F1FF 0%, #E8E3FF 50%, #D4CEFF 100%)' }}>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60]" style={{ background: 'linear-gradient(90deg, #7C6FCD, #A89BE8, #F5A623)' }}></div>

      {/* Sticky Navbar */}
      <header className={`fixed top-1 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl shadow-lg py-2' : 'py-4'}`} 
              style={{ background: scrolled ? 'rgba(243, 241, 255, 0.9)' : 'transparent' }}>
        <nav className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🍽️</span>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1535' }}>RestaurantPro</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-semibold" 
                    style={{ background: 'rgba(124, 111, 205, 0.1)', color: '#7C6FCD' }}>PRO</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'How It Works', 'Pricing', 'Testimonials', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                   className="text-sm font-medium transition-all duration-300 hover:opacity-80 relative group"
                   style={{ fontFamily: 'DM Sans, sans-serif', color: '#1A1535' }}>
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ background: '#7C6FCD' }}></span>
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/login')} 
                      className="transition-all duration-300 hover:scale-105" 
                      style={{ color: '#1A1535', fontFamily: 'DM Sans' }}>
                Login
              </Button>
              <Button onClick={() => router.push('/signup')} 
                      className="rounded-full px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg" 
                      style={{ background: '#7C6FCD', color: 'white', fontFamily: 'DM Sans' }}>
                Get Started Free <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden transition-transform duration-300 hover:scale-110" 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" style={{ color: '#1A1535' }} /> : <Menu className="h-6 w-6" style={{ color: '#1A1535' }} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4 border-t pt-4" style={{ borderColor: 'rgba(124, 111, 205, 0.2)' }}>
              {['Features', 'How It Works', 'Pricing', 'Testimonials', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} 
                   className="block text-sm font-medium py-2 transition-colors duration-300"
                   style={{ color: '#1A1535', fontFamily: 'DM Sans' }}
                   onClick={() => setMobileMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t" style={{ borderColor: 'rgba(124, 111, 205, 0.2)' }}>
                <Button variant="outline" onClick={() => router.push('/login')} 
                        className="transition-all duration-300" 
                        style={{ borderColor: '#7C6FCD', color: '#7C6FCD' }}>
                  Login
                </Button>
                <Button onClick={() => router.push('/signup')} 
                        className="transition-all duration-300" 
                        style={{ background: '#7C6FCD', color: 'white' }}>
                  Get Started Free
                </Button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden min-h-screen flex items-center">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-30 blur-3xl animate-pulse" 
             style={{ background: 'radial-gradient(circle, #A89BE8, transparent)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse" 
             style={{ background: 'radial-gradient(circle, #7C6FCD, transparent)', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-20 blur-3xl animate-pulse" 
             style={{ background: 'radial-gradient(circle, #F5A623, transparent)', animationDelay: '2s' }}></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full mb-6" 
                   style={{ background: 'rgba(124, 111, 205, 0.1)', border: '1px solid rgba(124, 111, 205, 0.2)' }}>
                <Star className="h-4 w-4 mr-2" style={{ color: '#F5A623' }} />
                <span className="text-sm font-medium" style={{ color: '#7C6FCD', fontFamily: 'DM Sans' }}>✦ Trusted by 500+ Restaurants</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" 
                  style={{ fontFamily: 'Playfair Display, serif', color: '#1A1535' }}>
                Run Your Restaurant Like a{' '}
                <span className="relative inline-block">
                  <span style={{ background: 'linear-gradient(135deg, #7C6FCD, #A89BE8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>5-Star</span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8">
                    <path d="M0 6 Q50 0 100 6 T200 6" stroke="#F5A623" strokeWidth="3" fill="none"/>
                  </svg>
                </span>
                {' '}Operation
              </h1>
              
              <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0" 
                 style={{ color: '#4A4A68', fontFamily: 'DM Sans', lineHeight: '1.8' }}>
                RestaurantPro handles billing, tables, orders, and analytics — focus on food, not paperwork.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button size="lg" onClick={() => router.push('/signup')}
                        className="rounded-full px-8 py-6 text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
                        style={{ background: '#F5A623', color: '#1A1535', fontFamily: 'DM Sans' }}>
                  🚀 Start Free Trial
                </Button>
                <Button size="lg" variant="outline"
                        className="rounded-full px-8 py-6 text-lg border-2 transition-all duration-300 hover:scale-105"
                        style={{ borderColor: '#7C6FCD', color: '#7C6FCD', fontFamily: 'DM Sans' }}>
                  <RefreshCw className="mr-2 h-5 w-5" /> Watch Demo
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm" 
                   style={{ color: '#4A4A68', fontFamily: 'DM Sans' }}>
                <span className="flex items-center"><Check className="h-4 w-4 mr-1" style={{ color: '#10B981' }} /> No credit card</span>
                <span className="flex items-center"><Check className="h-4 w-4 mr-1" style={{ color: '#10B981' }} /> 5 min setup</span>
                <span className="flex items-center"><Check className="h-4 w-4 mr-1" style={{ color: '#10B981' }} /> 14-day trial</span>
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-3">
                  {['PS', 'RM', 'AP', 'VK', 'SD'].map((initials, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-md transition-transform duration-300 hover:scale-110 hover:z-10"
                         style={{ background: ['#7C6FCD', '#F5A623', '#10B981', '#EF4444', '#3B82F6'][i], color: 'white' }}>
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="text-sm" style={{ color: '#4A4A68' }}>Join 500+ owners</span>
              </div>
            </div>

            {/* Right - Dashboard Mockup */}
            <div className="relative">
              <div className="rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-bounce" 
                   style={{ background: '#1A1535', border: '1px solid rgba(124, 111, 205, 0.3)', animationDuration: '6s' }}>
                <div className="absolute inset-0 opacity-10" 
                     style={{ background: 'linear-gradient(135deg, rgba(124, 111, 205, 0.3), transparent)' }}></div>
                
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
                      { label: 'Orders', value: '247', color: '#7C6FCD', icon: '📋' },
                      { label: 'Revenue', value: '₹45K', color: '#F5A623', icon: '💰' },
                      { label: 'Tables', value: '18', color: '#10B981', icon: '🍽️' }
                    ].map((stat, i) => (
                      <div key={i} className="rounded-xl p-4 transition-all duration-300 hover:scale-105" 
                           style={{ background: 'rgba(124, 111, 205, 0.1)', border: '1px solid rgba(124, 111, 205, 0.2)' }}>
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
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:translate-x-1" 
                           style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#7C6FCD' }}>
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
              <div className="absolute -bottom-4 -left-4 rounded-xl p-3 shadow-lg backdrop-blur-sm animate-bounce" 
                   style={{ background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(124, 111, 205, 0.2)', animationDuration: '3s' }}>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" style={{ color: '#F5A623' }} />
                  <span className="text-sm font-medium" style={{ color: '#1A1535', fontFamily: 'DM Sans' }}>3 sec billing</span>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 rounded-xl p-3 shadow-lg backdrop-blur-sm animate-bounce" 
                   style={{ background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(124, 111, 205, 0.2)', animationDuration: '3s', animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" style={{ color: '#7C6FCD' }} />
                  <span className="text-sm font-medium" style={{ color: '#1A1535', fontFamily: 'DM Sans' }}>Live reports</span>
                </div>
              </div>

              <div className="absolute bottom-1/3 -right-6 rounded-full px-3 py-2 shadow-lg backdrop-blur-sm" 
                   style={{ background: 'rgba(16, 185, 129, 0.9)' }}>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-white" />
                  <span className="text-xs font-medium text-white" style={{ fontFamily: 'DM Sans' }}>256-bit SSL</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8" style={{ color: '#7C6FCD' }} />
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-12 px-6" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 hover:scale-105"
                   style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' }}>
                <div style={{ color: '#7C6FCD' }}>{badge.icon}</div>
                <span className="text-sm font-medium" style={{ color: '#1A1535', fontFamily: 'DM Sans' }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <p className="text-center text-sm mb-8" style={{ color: '#4A4A68', fontFamily: 'DM Sans' }}>Trusted by leading restaurants</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {clientLogos.map((logo, i) => (
              <div key={i} className="px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 opacity-60 hover:opacity-100"
                   style={{ background: 'rgba(255, 255, 255, 0.5)', fontFamily: 'Playfair Display', color: '#1A1535', fontWeight: 600 }}>
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section ref={statsRef} className="py-16 px-6 relative overflow-hidden" style={{ background: '#1A1535' }}>
        <div className="absolute inset-0 opacity-20" 
             style={{ background: 'linear-gradient(135deg, #7C6FCD, #A89BE8, #F5A623)' }}></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: counters.restaurants, suffix: '+', label: 'Restaurants', icon: '🍽️' },
              { value: Math.floor(counters.orders / 1000000), suffix: 'M+', label: 'Orders', icon: '📋' },
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

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 relative">
        <div className="absolute inset-0 opacity-30" 
             style={{ background: 'radial-gradient(ellipse at top, #E8E3FF, transparent 50%)' }}></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>
              Everything Your Restaurant Needs
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#4A4A68', fontFamily: 'DM Sans' }}>
              Powerful features to streamline every aspect of your operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} 
                   className="group rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                   style={{ 
                     background: 'rgba(255, 255, 255, 0.7)', 
                     backdropFilter: 'blur(20px)',
                     border: '1px solid rgba(124, 111, 205, 0.1)',
                     boxShadow: '0 4px 20px rgba(124, 111, 205, 0.1)'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.boxShadow = '0 20px 40px rgba(124, 111, 205, 0.2)';
                     e.currentTarget.style.borderColor = 'rgba(124, 111, 205, 0.3)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 111, 205, 0.1)';
                     e.currentTarget.style.borderColor = 'rgba(124, 111, 205, 0.1)';
                   }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                       style={{ background: 'linear-gradient(135deg, rgba(124, 111, 205, 0.1), rgba(168, 155, 232, 0.1))' }}>
                    <div style={{ color: '#7C6FCD' }}>{feature.icon}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(245, 166, 35, 0.1)', color: '#F5A623' }}>
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>{feature.title}</h3>
                <p style={{ color: '#4A4A68', fontFamily: 'DM Sans', lineHeight: '1.6' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 relative overflow-hidden" 
               style={{ background: 'linear-gradient(180deg, #F3F1FF 0%, #E8E3FF 100%)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>
              Up and Running in Minutes
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#4A4A68', fontFamily: 'DM Sans' }}>
              From signup to first order in 8 simple steps
            </p>
          </div>

          {/* Desktop Timeline */}
          <div className="hidden lg:block relative">
            <div className="absolute top-16 left-0 right-0 h-1 rounded-full" style={{ background: 'rgba(124, 111, 205, 0.2)' }}></div>
            <div className="absolute top-16 left-0 h-1 rounded-full transition-all duration-1000" 
                 style={{ background: 'linear-gradient(90deg, #7C6FCD, #A89BE8)', width: `${(activeStep / 7) * 100}%` }}></div>

            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <div key={i} data-step={i} className="text-center relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${
                    i <= activeStep ? 'scale-110 shadow-lg' : ''
                  }`}
                       style={{ 
                         background: i <= activeStep ? '#7C6FCD' : 'rgba(124, 111, 205, 0.1)',
                         border: i <= activeStep ? 'none' : '2px solid rgba(124, 111, 205, 0.3)'
                       }}>
                    <span style={{ color: i <= activeStep ? 'white' : '#7C6FCD' }}>{step.icon}</span>
                  </div>
                  <div className="text-xs font-bold mb-1" style={{ color: '#7C6FCD', fontFamily: 'DM Sans' }}>{step.num}</div>
                  <h4 className="font-bold mb-1" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>{step.name}</h4>
                  <p className="text-sm" style={{ color: '#4A4A68', fontFamily: 'DM Sans' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Steps */}
          <div className="lg:hidden space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl"
                   style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{ background: '#7C6FCD' }}>
                  <span className="text-white">{step.icon}</span>
                </div>
                <div>
                  <div className="text-xs font-bold mb-1" style={{ color: '#7C6FCD' }}>{step.num}</div>
                  <h4 className="font-bold" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>{step.name}</h4>
                  <p className="text-sm" style={{ color: '#4A4A68' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => router.push('/signup')}
                    className="rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{ background: '#7C6FCD', color: 'white', fontFamily: 'DM Sans' }}>
              Start Your Journey <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-6" style={{ background: '#1A1535' }}>
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
                  <th className="text-center py-4 px-6 rounded-t-xl" style={{ background: 'linear-gradient(135deg, #7C6FCD, #A89BE8)' }}>
                    <span className="text-white font-bold" style={{ fontFamily: 'Playfair Display' }}>RestaurantPro</span>
                    <span className="block text-xs text-purple-200 mt-1">Recommended</span>
                  </th>
                  <th className="text-center py-4 px-6 text-gray-400 font-medium" style={{ fontFamily: 'DM Sans' }}>Traditional POS</th>
                  <th className="text-center py-4 px-6 text-gray-400 font-medium" style={{ fontFamily: 'DM Sans' }}>Manual</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-4 px-6 text-white font-medium" style={{ fontFamily: 'DM Sans' }}>{row.feature}</td>
                    <td className="py-4 px-6 text-center" style={{ background: 'rgba(124, 111, 205, 0.1)' }}>
                      <span className="text-green-400 font-semibold flex items-center justify-center gap-2">
                        <Check className="h-4 w-4" /> {row.us}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-400">{row.traditional}</td>
                    <td className="py-4 px-6 text-center text-gray-500">{row.manual}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-6 px-6 text-white font-bold" style={{ fontFamily: 'Playfair Display' }}>Score</td>
                  <td className="py-6 px-6 text-center" style={{ background: 'rgba(124, 111, 205, 0.2)' }}>
                    <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display' }}>10/10</span>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <span className="text-2xl font-bold text-gray-400" style={{ fontFamily: 'Playfair Display' }}>5/10</span>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <span className="text-2xl font-bold text-gray-500" style={{ fontFamily: 'Playfair Display' }}>2/10</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #F3F1FF 0%, #E8E3FF 100%)' }}>
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full opacity-20 blur-3xl" 
             style={{ background: '#A89BE8' }}></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full opacity-20 blur-3xl" 
             style={{ background: '#7C6FCD' }}></div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>
              Loved by 500+ Owners
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#4A4A68', fontFamily: 'DM Sans' }}>
              Real stories from restaurant owners across India
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial, i) => (
              <div key={i} 
                   className={`rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 ${
                     currentTestimonial === i ? 'ring-2 ring-offset-4' : ''
                   }`}
                   style={{ 
                     background: 'rgba(255, 255, 255, 0.8)', 
                     backdropFilter: 'blur(20px)',
                     boxShadow: '0 10px 40px rgba(124, 111, 205, 0.1)',
                     border: '1px solid rgba(124, 111, 205, 0.1)',
                     ringColor: currentTestimonial === i ? '#7C6FCD' : 'transparent'
                   }}>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-current" style={{ color: '#F5A623' }} />
                  ))}
                </div>
                <p className="text-lg mb-6 italic" style={{ color: '#4A4A68', fontFamily: 'DM Sans', lineHeight: '1.7' }}>
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                         style={{ background: 'linear-gradient(135deg, #7C6FCD, #A89BE8)' }}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>{testimonial.name}</p>
                      <p className="text-sm" style={{ color: '#4A4A68', fontFamily: 'DM Sans' }}>{testimonial.restaurant}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                    {testimonial.revenue}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Happy Restaurants', icon: '❤️' },
              { value: '4.9/5', label: 'Average Rating', icon: '⭐' },
              { value: '1M+', label: 'Orders Processed', icon: '📋' },
              { value: '99%', label: 'Would Recommend', icon: '👍' }
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl transition-all duration-300 hover:scale-105"
                   style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: '#4A4A68', fontFamily: 'DM Sans' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#4A4A68', fontFamily: 'DM Sans' }}>
              Choose the plan that fits your restaurant
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div key={i} 
                   className={`rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 relative ${
                     plan.popular ? 'transform scale-105' : ''
                   }`}
                   style={{ 
                     background: plan.popular 
                       ? 'linear-gradient(135deg, #7C6FCD, #A89BE8)' 
                       : 'rgba(255, 255, 255, 0.8)',
                     backdropFilter: 'blur(20px)',
                     boxShadow: plan.popular 
                       ? '0 20px 60px rgba(124, 111, 205, 0.4)' 
                       : '0 10px 40px rgba(124, 111, 205, 0.1)',
                     border: plan.popular ? 'none' : '1px solid rgba(124, 111, 205, 0.1)'
                   }}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-sm font-bold text-white shadow-lg"
                          style={{ background: '#F5A623' }}>
                      ⭐ Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2" 
                    style={{ fontFamily: 'Playfair Display', color: plan.popular ? 'white' : '#1A1535' }}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold" 
                        style={{ fontFamily: 'Playfair Display', color: plan.popular ? 'white' : '#1A1535' }}>
                    {plan.price}
                  </span>
                  <span style={{ color: plan.popular ? 'rgba(255,255,255,0.8)' : '#4A4A68' }}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2" 
                        style={{ color: plan.popular ? 'white' : '#4A4A68', fontFamily: 'DM Sans' }}>
                      <Check className="h-4 w-4" style={{ color: plan.popular ? '#F5A623' : '#10B981' }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-full py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
                        style={{ 
                          background: plan.popular ? 'white' : '#7C6FCD',
                          color: plan.popular ? '#7C6FCD' : 'white',
                          fontFamily: 'DM Sans'
                        }}
                        onClick={() => router.push('/signup')}>
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 flex flex-wrap gap-6 justify-center" style={{ color: '#4A4A68', fontFamily: 'DM Sans' }}>
            <span className="flex items-center"><Check className="h-4 w-4 mr-2" style={{ color: '#10B981' }} /> 14-day free trial</span>
            <span className="flex items-center"><Check className="h-4 w-4 mr-2" style={{ color: '#10B981' }} /> No setup fees</span>
            <span className="flex items-center"><Check className="h-4 w-4 mr-2" style={{ color: '#10B981' }} /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #E8E3FF 0%, #D4CEFF 100%)' }}>
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>
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
              <div key={i} className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
                   style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}>
                <h3 className="font-bold mb-2" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>{faq.q}</h3>
                <p style={{ color: '#4A4A68', fontFamily: 'DM Sans', lineHeight: '1.6' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>
                Get in Touch
              </h2>
              <p className="text-lg mb-8" style={{ color: '#4A4A68', fontFamily: 'DM Sans', lineHeight: '1.8' }}>
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
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#7C6FCD' }}>
                      {contact.icon}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#1A1535', fontFamily: 'DM Sans' }}>{contact.label}</p>
                      <p style={{ color: '#4A4A68' }}>{contact.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>Our Team</h3>
                <div className="flex gap-4">
                  {[
                    { name: 'Shaurya Deep', role: 'Founder & CEO', initials: 'SD' },
                    { name: 'Dev Team', role: 'Engineering', initials: 'DT' },
                    { name: 'Support Team', role: '24/7 Support', initials: 'ST' }
                  ].map((member, i) => (
                    <div key={i} className="text-center">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white mb-2 shadow-lg transition-transform duration-300 hover:scale-110"
                           style={{ background: ['#7C6FCD', '#F5A623', '#10B981'][i] }}>
                        {member.initials}
                      </div>
                      <p className="text-sm font-semibold" style={{ color: '#1A1535' }}>{member.name}</p>
                      <p className="text-xs" style={{ color: '#4A4A68' }}>{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-8 shadow-xl" 
                 style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)' }}>
              <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Playfair Display', color: '#1A1535' }}>
                Send us a Message
              </h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1A1535', fontFamily: 'DM Sans' }}>Name</label>
                    <input type="text" placeholder="Your name" 
                           className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                           style={{ borderColor: 'rgba(124, 111, 205, 0.2)', background: 'white', fontFamily: 'DM Sans' }}
                           onFocus={(e) => e.target.style.borderColor = '#7C6FCD'}
                           onBlur={(e) => e.target.style.borderColor = 'rgba(124, 111, 205, 0.2)'} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1A1535', fontFamily: 'DM Sans' }}>Phone</label>
                    <input type="tel" placeholder="+91 98765 43210" 
                           className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                           style={{ borderColor: 'rgba(124, 111, 205, 0.2)', background: 'white', fontFamily: 'DM Sans' }}
                           onFocus={(e) => e.target.style.borderColor = '#7C6FCD'}
                           onBlur={(e) => e.target.style.borderColor = 'rgba(124, 111, 205, 0.2)'} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A1535', fontFamily: 'DM Sans' }}>Email</label>
                  <input type="email" placeholder="you@example.com" 
                         className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                         style={{ borderColor: 'rgba(124, 111, 205, 0.2)', background: 'white', fontFamily: 'DM Sans' }}
                         onFocus={(e) => e.target.style.borderColor = '#7C6FCD'}
                         onBlur={(e) => e.target.style.borderColor = 'rgba(124, 111, 205, 0.2)'} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A1535', fontFamily: 'DM Sans' }}>Restaurant Name</label>
                  <input type="text" placeholder="Your restaurant" 
                         className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none"
                         style={{ borderColor: 'rgba(124, 111, 205, 0.2)', background: 'white', fontFamily: 'DM Sans' }}
                         onFocus={(e) => e.target.style.borderColor = '#7C6FCD'}
                         onBlur={(e) => e.target.style.borderColor = 'rgba(124, 111, 205, 0.2)'} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A1535', fontFamily: 'DM Sans' }}>Message</label>
                  <textarea rows={4} placeholder="Tell us about your restaurant..." 
                            className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none resize-none"
                            style={{ borderColor: 'rgba(124, 111, 205, 0.2)', background: 'white', fontFamily: 'DM Sans' }}
                            onFocus={(e) => e.target.style.borderColor = '#7C6FCD'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(124, 111, 205, 0.2)'}></textarea>
                </div>
                <Button type="submit" 
                        className="w-full rounded-xl py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        style={{ background: '#7C6FCD', color: 'white', fontFamily: 'DM Sans' }}>
                  Send Message <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Download */}
      <section className="py-20 px-6" style={{ background: '#1A1535' }}>
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'Playfair Display' }}>
            Take It With You
          </h2>
          <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto" style={{ fontFamily: 'DM Sans' }}>
            Download our mobile app and manage your restaurant from anywhere
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline"
                    className="rounded-full px-8 py-6 text-lg border-2 transition-all duration-300 hover:scale-105"
                    style={{ borderColor: 'white', color: 'white', fontFamily: 'DM Sans' }}>
              <Smartphone className="mr-2 h-5 w-5" /> iOS App
            </Button>
            <Button size="lg" variant="outline"
                    className="rounded-full px-8 py-6 text-lg border-2 transition-all duration-300 hover:scale-105"
                    style={{ borderColor: 'white', color: 'white', fontFamily: 'DM Sans' }}>
              <Monitor className="mr-2 h-5 w-5" /> Android App
            </Button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7C6FCD, #A89BE8)' }}>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'Playfair Display' }}>
            Join 500+ Restaurants Growing
          </h2>
          <p className="text-lg mb-8 text-purple-100 max-w-2xl mx-auto" style={{ fontFamily: 'DM Sans' }}>
            Start your free trial today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/signup')}
                    className="rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    style={{ background: '#F5A623', color: '#1A1535', fontFamily: 'DM Sans' }}>
              Get Started Free <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login')}
                    className="rounded-full px-8 py-6 text-lg border-2 transition-all duration-300 hover:scale-105"
                    style={{ borderColor: 'white', color: 'white', fontFamily: 'DM Sans' }}>
              Login to Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{ background: 'rgba(26, 21, 53, 0.95)', borderColor: 'rgba(124, 111, 205, 0.2)' }}>
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
                       className="flex-1 px-4 py-2 rounded-lg text-sm transition-all duration-300 focus:outline-none"
                       style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(124, 111, 205, 0.3)', color: 'white', fontFamily: 'DM Sans' }} />
                <Button size="sm" style={{ background: '#7C6FCD', color: 'white' }}>Subscribe</Button>
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

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center" style={{ borderColor: 'rgba(124, 111, 205, 0.2)' }}>
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'DM Sans' }}>
              © 2026 RestaurantPro. Made with ❤️ by Team Shaurya | Nexus
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              {['Twitter', 'LinkedIn', 'Instagram', 'YouTube'].map((social, i) => (
                <a key={i} href="#" className="text-gray-400 transition-colors duration-300 hover:text-white">
                  <span className="text-sm">{social}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #F3F1FF;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #7C6FCD;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #A89BE8;
        }
      `}</style>
    </div>
  );
}