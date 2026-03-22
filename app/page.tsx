'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { persistentUserStorage } from '@/lib/persistent-user-storage';

export default function Home() {
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;

    // Check for existing user and system lock
    const currentUser = persistentUserStorage.getCurrentUser();
    const isLocked = persistentUserStorage.isLocked();

    if (isLocked) {
      // System is locked, go to login (locked page will show)
      hasRedirected.current = true;
      console.log('[Home] System locked, redirecting to login');
      router.push('/login');
    } else if (currentUser) {
      // User already logged in, check setup
      const setup = persistentUserStorage.getSetup();
      if (!setup || !setup.tablesCount) {
        hasRedirected.current = true;
        console.log('[Home] No setup, redirecting to setup');
        router.push('/setup');
      } else {
        hasRedirected.current = true;
        console.log('[Home] User found, redirecting to dashboard');
        router.push('/dashboard');
      }
    } else {
      // No user, go to login
      hasRedirected.current = true;
      console.log('[Home] No user found, redirecting to login');
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-300">Loading...</p>
      </div>
    </div>
  );
}
