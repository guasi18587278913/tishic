'use client'

import { useEffect } from 'react'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Stats from '../components/Stats'
import Footer from '../components/Footer'
import { apiWarmup, APIWarmup, setupDefaultWarmupTasks } from '../lib/api-warmup'
import { promptPreloader } from '../lib/prompt-preloader'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'

export default function LandingPage() {
  const { getMetrics } = usePerformanceMonitor()

  // 页面加载时开始API预热
  useEffect(() => {
    // 设置预连接
    APIWarmup.setupPreconnect()
    
    // 设置默认预热任务
    setupDefaultWarmupTasks()
    
    // 开始API预热（在页面加载后立即开始）
    const warmupTimer = setTimeout(() => {
      apiWarmup.startWarmup()
    }, 100) // 100ms延迟，确保页面基本加载完成
    
    // 开始预加载常用提示词（稍后执行）
    const preloadTimer = setTimeout(() => {
      promptPreloader.startPreloading()
    }, 2000) // 2秒延迟，避免影响首屏渲染
    
    // 性能监控日志
    const metricsTimer = setInterval(() => {
      const metrics = getMetrics()
      if (metrics.totalRequests > 0) {
        console.log('Performance metrics:', metrics)
      }
    }, 10000) // 每10秒记录一次
    
    return () => {
      clearTimeout(warmupTimer)
      clearTimeout(preloadTimer)
      clearInterval(metricsTimer)
    }
  }, [])

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
      
      {/* Footer */}
      <Footer />
    </main>
  )
}