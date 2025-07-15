'use client'

import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  apiLatency: number[]
  renderTime: number[]
  cacheHitRate: number
}

export function usePerformanceMonitor() {
  const metricsRef = useRef<PerformanceMetrics>({
    apiLatency: [],
    renderTime: [],
    cacheHitRate: 0,
  })

  useEffect(() => {
    // 监控 API 请求性能
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      
      try {
        const response = await originalFetch(...args)
        const endTime = performance.now()
        const latency = endTime - startTime
        
        // 记录 API 延迟
        metricsRef.current.apiLatency.push(latency)
        
        // 检查缓存命中
        if (response.headers.get('X-Cache') === 'HIT') {
          metricsRef.current.cacheHitRate = 
            (metricsRef.current.cacheHitRate * 0.9) + 0.1
        } else {
          metricsRef.current.cacheHitRate *= 0.9
        }
        
        // 如果延迟过高，输出警告
        if (latency > 3000) {
          console.warn(`Slow API request detected: ${latency.toFixed(0)}ms`, args[0])
        }
        
        return response
      } catch (error) {
        throw error
      }
    }

    // 监控渲染性能
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            metricsRef.current.renderTime.push(entry.duration)
          }
        }
      })
      
      observer.observe({ entryTypes: ['measure'] })
      
      return () => {
        observer.disconnect()
        window.fetch = originalFetch
      }
    }
  }, [])

  const getMetrics = () => {
    const metrics = metricsRef.current
    
    const avgApiLatency = metrics.apiLatency.length > 0
      ? metrics.apiLatency.reduce((a, b) => a + b, 0) / metrics.apiLatency.length
      : 0
      
    const avgRenderTime = metrics.renderTime.length > 0
      ? metrics.renderTime.reduce((a, b) => a + b, 0) / metrics.renderTime.length
      : 0

    return {
      avgApiLatency: Math.round(avgApiLatency),
      avgRenderTime: Math.round(avgRenderTime),
      cacheHitRate: Math.round(metrics.cacheHitRate * 100),
      totalRequests: metrics.apiLatency.length,
    }
  }

  return { getMetrics }
}