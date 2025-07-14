'use client'

import { useState } from 'react'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Stats from './components/Stats'
import OptimizationDemo from './components/OptimizationDemo'
import Footer from './components/Footer'
import { OptimizationState } from './types'

export default function Home() {
  const [optimizationState, setOptimizationState] = useState<OptimizationState>({
    originalPrompt: '',
    stage: 'input',
    questions: [],
    answers: {},
    optimizedPrompt: '',
  })
  const [enableStreaming, setEnableStreaming] = useState(true)

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <Features />
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* Stats Section */}
      <Stats />
      
      {/* Demo Section */}
      <OptimizationDemo 
        optimizationState={optimizationState}
        setOptimizationState={setOptimizationState}
        enableStreaming={enableStreaming}
        setEnableStreaming={setEnableStreaming}
      />
      
      {/* Footer */}
      <Footer />
    </main>
  )
}