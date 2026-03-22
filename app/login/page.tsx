'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { persistentUserStorage, OfflineUser } from '@/lib/persistent-user-storage';
import { Lock, Mail, Key, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uniqueKey, setUniqueKey] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'waiter' | 'chef'>('waiter');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if system is locked on mount
  useEffect(() => {
    // Prevent infinite redirects in offline mode
    let isRedirecting = false;

    const checkAndRedirect = () => {
      if (isRedirecting) return;

      const locked = persistentUserStorage.isLocked();
      setIsLocked(locked);

      // If user is already logged in and system is not locked, redirect to dashboard
      const currentUser = persistentUserStorage.getCurrentUser();
      if (currentUser && !locked) {
        isRedirecting = true;
        console.log('[Login] User found, redirecting to dashboard');
        router.push('/dashboard');
      }
    };

    // Check once on mount
    checkAndRedirect();

    // Prevent multiple checks
    return () => {
      isRedirecting = true;
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check system lock
      if (persistentUserStorage.isLocked()) {
        setError('System is locked. Please enter the unlock code.');
        setIsLocked(true);
        setLoading(false);
        return;
      }

      // Attempt login
      const user = persistentUserStorage.loginUser(email, password);

      if (user) {
        // Check if first login - show setup wizard
        const setup = persistentUserStorage.getSetup();
        if (!setup || !setup.tablesCount) {
          router.push('/setup');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify unique key (only admin needs entry key for first user)
      const existingUsers = persistentUserStorage.getAllUsers();

      if (existingUsers.length === 0) {
        // First user - verify admin key
        if (uniqueKey !== 'NEXUS2026') {
          setError('Invalid unique key. Please contact administrator.');
          setLoading(false);
          return;
        }
      }

      // Check if email already exists
      if (persistentUserStorage.userExists(email)) {
        setError('Email already registered');
        setLoading(false);
        return;
      }

      // Create new user
      const newUser: OfflineUser = {
        id: `user-${Date.now()}`,
        email,
        password,
        name,
        role: existingUsers.length === 0 ? 'admin' : role,
        createdAt: new Date().toISOString(),
      };

      persistentUserStorage.saveUser(newUser);

      // If first user, initialize lock
      if (existingUsers.length === 0) {
        persistentUserStorage.initializeLock();
      }

      // Auto-login
      persistentUserStorage.loginUser(email, password);

      // Redirect to setup
      router.push('/setup');
    } catch (err) {
      setError('Signup failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (persistentUserStorage.unlockSystem(unlockCode)) {
      setIsLocked(false);
      setUnlockCode('');
    } else {
      setError('Invalid unlock code');
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <Lock className="text-red-600" size={32} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">System Locked</h1>
          <p className="text-center text-slate-600 mb-6">
            This month's unlock is required. Please enter the unlock code to continue.
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Key size={16} className="inline mr-2" />
                Unlock Code
              </label>
              <input
                type="password"
                value={unlockCode}
                onChange={(e) => setUnlockCode(e.target.value)}
                placeholder="Enter unlock code"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={16} className="text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Unlocking...' : 'Unlock'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">RestaurantPRO</h1>
          <p className="text-slate-600 text-sm">Team SHAURYA | NEXUS</p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              mode === 'login'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              mode === 'signup'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Lock size={16} className="inline mr-2" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={16} className="text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Lock size={16} className="inline mr-2" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Key size={16} className="inline mr-2" />
                Unique Key (First User Only)
              </label>
              <input
                type="password"
                value={uniqueKey}
                onChange={(e) => setUniqueKey(e.target.value)}
                placeholder="Enter unique key"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">
                Required only if you're the first user. Ask administrator for the key.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role (if not first user)</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="waiter">Waiter</option>
                <option value="chef">Chef / Kitchen</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={16} className="text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Works offline - Your data is stored securely on this device
        </p>
      </div>
    </div>
  );
}
