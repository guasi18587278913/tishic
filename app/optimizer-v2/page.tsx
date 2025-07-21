'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OptimizationHeader from '../components/OptimizationHeader'
import SmartPromptOptimizer from '../components/SmartPromptOptimizer'
import { OptimizationResult } from '../types/index'

export default function OptimizerV2Page() {
  const router = useRouter()

  const handleOptimizationComplete = (result: OptimizationResult) => {
    // Handle completion if needed
    console.log('Optimization completed:', result)
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900">
      {/* Aurora background effect - more subtle */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/5 via-transparent to-transparent blur-3xl animate-float" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/5 via-transparent to-transparent blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <OptimizationHeader />

      {/* Main Content - Single column layout */}
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <SmartPromptOptimizer 
          onOptimizationComplete={handleOptimizationComplete}
        />
      </main>
    </div>
  )
}