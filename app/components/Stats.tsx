'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Stats() {
  const [counts, setCounts] = useState({
    users: 0,
    optimizations: 0,
    satisfaction: 0,
  })

  useEffect(() => {
    const duration = 2000
    const steps = 50
    const interval = duration / steps

    const targets = {
      users: 5000,
      optimizations: 50000,
      satisfaction: 98,
    }

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setCounts({
        users: Math.floor(targets.users * progress),
        optimizations: Math.floor(targets.optimizations * progress),
        satisfaction: Math.floor(targets.satisfaction * progress),
      })

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-white">用数据说话</span>
          </h2>
          <p className="text-xl text-gray-400">每一个数字都代表着用户的信任</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="relative inline-block">
              <div className="text-7xl md:text-8xl font-bold text-gradient mb-4">
                {counts.users.toLocaleString()}+
              </div>
              <div className="absolute -inset-4 bg-purple-500 rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">活跃用户</h3>
            <p className="text-gray-400">Active Users</p>
          </div>

          <div className="text-center group">
            <div className="relative inline-block">
              <div className="text-7xl md:text-8xl font-bold text-gradient-blue mb-4">
                {counts.optimizations.toLocaleString()}+
              </div>
              <div className="absolute -inset-4 bg-blue-500 rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">优化次数</h3>
            <p className="text-gray-400">Optimizations</p>
          </div>

          <div className="text-center group">
            <div className="relative inline-block">
              <div className="text-7xl md:text-8xl font-bold text-gradient mb-4">
                {counts.satisfaction}%
              </div>
              <div className="absolute -inset-4 bg-pink-500 rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">满意度</h3>
            <p className="text-gray-400">Satisfaction Rate</p>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="mt-16 glass rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-6">优化效果对比</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">原始提示词</span>
                <span className="text-gray-400">32%</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" style={{ width: '32%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white font-semibold">优化后提示词</span>
                <span className="text-white font-semibold">95%</span>
              </div>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '95%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Final Call to Action */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold mb-4">
            加入 <span className="text-gradient">{counts.users.toLocaleString()}+</span> 用户的选择
          </h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
            体验智能提示词优化带来的效率提升，让AI成为你的得力助手
          </p>
          <Link 
            href="/optimizer"
            className="inline-flex items-center gap-3 px-10 py-5 gradient-button-primary rounded-xl font-semibold text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/30 group"
          >
            <i className="fas fa-rocket group-hover:rotate-12 transition-transform"></i>
            立即开始优化
            <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
          </Link>
        </div>
      </div>
    </section>
  )
}