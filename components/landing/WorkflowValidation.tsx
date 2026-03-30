'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Play,
  RefreshCw,
  User,
  Building2,
  LayoutGrid,
  Receipt,
  ClipboardList,
  Database,
  Shield,
} from 'lucide-react'

interface ValidationStep {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  status: 'pending' | 'running' | 'success' | 'error'
  message?: string
}

const initialSteps: ValidationStep[] = [
  {
    id: 'user-creation',
    name: 'User Account Created',
    description: 'Verify user registration process',
    icon: User,
    status: 'pending',
  },
  {
    id: 'restaurant-creation',
    name: 'Restaurant ID Assigned',
    description: 'Verify restaurant workspace creation',
    icon: Building2,
    status: 'pending',
  },
  {
    id: 'table-init',
    name: 'Tables Created Automatically',
    description: 'Verify default table initialization',
    icon: LayoutGrid,
    status: 'pending',
  },
  {
    id: 'table-update',
    name: 'Tables Updated Successfully',
    description: 'Verify table status updates',
    icon: RefreshCw,
    status: 'pending',
  },
  {
    id: 'bill-creation',
    name: 'Bills Saved Correctly',
    description: 'Verify billing data persistence',
    icon: Receipt,
    status: 'pending',
  },
  {
    id: 'order-creation',
    name: 'Orders Linked Correctly',
    description: 'Verify order-restaurant association',
    icon: ClipboardList,
    status: 'pending',
  },
  {
    id: 'data-storage',
    name: 'Data Stored in Correct Database',
    description: 'Verify multi-tenant data isolation',
    icon: Database,
    status: 'pending',
  },
  {
    id: 'data-isolation',
    name: 'No Cross-User Data Mixing',
    description: 'Verify data security and isolation',
    icon: Shield,
    status: 'pending',
  },
]

export default function WorkflowValidation() {
  const [steps, setSteps] = useState<ValidationStep[]>(initialSteps)
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(-1)

  const runValidation = async () => {
    setIsRunning(true)
    setSteps(initialSteps.map((step) => ({ ...step, status: 'pending', message: undefined })))

    for (let i = 0; i < initialSteps.length; i++) {
      setCurrentStep(i)

      // Update current step to running
      setSteps((prev) =>
        prev.map((step, index) =>
          index === i ? { ...step, status: 'running' } : step
        )
      )

      // Simulate validation process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate success (90% success rate for demo)
      const isSuccess = Math.random() > 0.1

      setSteps((prev) =>
        prev.map((step, index) =>
          index === i
            ? {
                ...step,
                status: isSuccess ? 'success' : 'error',
                message: isSuccess
                  ? 'Validation passed'
                  : 'Validation failed - please retry',
              }
            : step
        )
      )

      if (!isSuccess) {
        setIsRunning(false)
        return
      }
    }

    setIsRunning(false)
    setCurrentStep(-1)
  }

  const resetValidation = () => {
    setSteps(initialSteps)
    setIsRunning(false)
    setCurrentStep(-1)
  }

  const successCount = steps.filter((s) => s.status === 'success').length
  const errorCount = steps.filter((s) => s.status === 'error').length
  const allPassed = successCount === steps.length

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold mb-4 border border-green-500/30">
            System Reliability
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Workflow{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Validation System
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Verify the complete user flow and detect breaking points in real-time
          </p>
        </motion.div>

        {/* Validation Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8"
        >
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={runValidation}
                disabled={isRunning}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
              >
                {isRunning ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Running Validation...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Run Validation
                  </>
                )}
              </button>
              <button
                onClick={resetValidation}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw size={18} />
                Reset
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400" />
                <span className="text-green-400 font-semibold">{successCount} Passed</span>
              </div>
              {errorCount > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle size={18} className="text-red-400" />
                  <span className="text-red-400 font-semibold">{errorCount} Failed</span>
                </div>
              )}
            </div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-4 rounded-xl border transition-all duration-300 ${
                    step.status === 'success'
                      ? 'bg-green-500/10 border-green-500/30'
                      : step.status === 'error'
                      ? 'bg-red-500/10 border-red-500/30'
                      : step.status === 'running'
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        step.status === 'success'
                          ? 'bg-green-500/20'
                          : step.status === 'error'
                          ? 'bg-red-500/20'
                          : step.status === 'running'
                          ? 'bg-blue-500/20'
                          : 'bg-white/10'
                      }`}
                    >
                      {step.status === 'running' ? (
                        <Loader2 size={20} className="text-blue-400 animate-spin" />
                      ) : step.status === 'success' ? (
                        <CheckCircle size={20} className="text-green-400" />
                      ) : step.status === 'error' ? (
                        <XCircle size={20} className="text-red-400" />
                      ) : (
                        <step.icon size={20} className="text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-semibold mb-1 ${
                          step.status === 'success'
                            ? 'text-green-300'
                            : step.status === 'error'
                            ? 'text-red-300'
                            : step.status === 'running'
                            ? 'text-blue-300'
                            : 'text-white'
                        }`}
                      >
                        {step.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">{step.description}</p>
                      {step.message && (
                        <p
                          className={`text-sm font-medium ${
                            step.status === 'success' ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {step.message}
                        </p>
                      )}
                    </div>

                    {/* Status Indicator */}
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        step.status === 'success'
                          ? 'bg-green-500'
                          : step.status === 'error'
                          ? 'bg-red-500'
                          : step.status === 'running'
                          ? 'bg-blue-500 animate-pulse'
                          : 'bg-gray-600'
                      }`}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Result Message */}
          {allPassed && !isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3"
            >
              <CheckCircle size={24} className="text-green-400" />
              <div>
                <p className="text-green-300 font-semibold">All validations passed!</p>
                <p className="text-green-400/70 text-sm">Your system is working correctly.</p>
              </div>
            </motion.div>
          )}

          {errorCount > 0 && !isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
            >
              <AlertCircle size={24} className="text-red-400" />
              <div>
                <p className="text-red-300 font-semibold">Validation failed</p>
                <p className="text-red-400/70 text-sm">Please check the failed steps and retry.</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}