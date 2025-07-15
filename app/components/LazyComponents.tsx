'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// 加载骨架屏
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-800 rounded-xl"></div>
  </div>
)

// 懒加载重型组件
export const LazyOptimizationDemo = dynamic(
  () => import('./OptimizationDemo'),
  {
    loading: () => <LoadingSkeleton />,
    ssr: true,
  }
)

export const LazyHowItWorks = dynamic(
  () => import('./HowItWorks'),
  {
    loading: () => <LoadingSkeleton />,
    ssr: true,
  }
)

export const LazyStats = dynamic(
  () => import('./Stats'),
  {
    loading: () => <LoadingSkeleton />,
    ssr: true,
  }
)

// 优化的图片组件
export const OptimizedImage = dynamic(
  () => import('next/image'),
  {
    loading: () => <div className="bg-gray-800 animate-pulse" />,
    ssr: true,
  }
)