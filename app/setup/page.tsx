'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { persistentUserStorage } from '@/lib/persistent-user-storage';
import { AlertCircle, Check } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [tablesCount, setTablesCount] = useState(5);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'tables' | 'complete'>('tables');

  const handleSetupComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tablesCount < 1 || tablesCount > 100) {
        setError('Please enter between 1 and 100 tables');
        setLoading(false);
        return;
      }

      // Save setup data
      persistentUserStorage.saveSetup({
        tablesCount,
        setupDate: new Date().toISOString(),
      });

      // Create tables in local storage
      const tables = Array.from({ length: tablesCount }, (_, i) => ({
        id: `table-${i + 1}`,
        number: i + 1,
        capacity: 4,
        status: 'available', // 'available' | 'occupied' | 'reserved'
        currentBill: null,
        reservedUntil: null,
      }));

      persistentUserStorage.saveTables(tables);

      setStep('complete');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Setup failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        {step === 'tables' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Initial Setup</h1>
              <p className="text-slate-600">Configure your restaurant</p>
            </div>

            <form onSubmit={handleSetupComplete} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  How many tables do you have?
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tablesCount}
                  onChange={(e) => setTablesCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold text-center"
                />
                <p className="text-xs text-slate-500 mt-2">
                  You can add or remove tables later from the Dashboard
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={16} className="text-red-600" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Your restaurant data will be stored locally on this device. Make sure you manage regular backups.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </form>
          </>
        )}

        {step === 'complete' && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-100 p-4 rounded-full">
                <Check className="text-emerald-600" size={32} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Setup Complete!</h1>
            <p className="text-slate-600 mb-6">
              Your restaurant with {tablesCount} tables is ready to use.
            </p>
            <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
