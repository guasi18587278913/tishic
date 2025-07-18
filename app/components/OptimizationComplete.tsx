'use client'

import { useState } from 'react'

interface OptimizationCompleteProps {
  originalPrompt: string
  optimizedPrompt: string
  onReoptimize?: () => void
  onNewPrompt?: () => void
}

export default function OptimizationComplete({
  originalPrompt,
  optimizedPrompt,
  onReoptimize,
  onNewPrompt
}: OptimizationCompleteProps) {
  const [copiedOriginal, setCopiedOriginal] = useState(false)
  const [copiedOptimized, setCopiedOptimized] = useState(false)

  // 计算优化提升百分比
  const improvementPercentage = Math.round((optimizedPrompt.length / originalPrompt.length) * 100 - 100)

  const handleCopy = async (text: string, isOriginal: boolean) => {
    try {
      await navigator.clipboard.writeText(text)
      if (isOriginal) {
        setCopiedOriginal(true)
        setTimeout(() => setCopiedOriginal(false), 2000)
      } else {
        setCopiedOptimized(true)
        setTimeout(() => setCopiedOptimized(false), 2000)
      }
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 简洁标题 */}
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-3xl font-extralight text-white">
          提示词优化提升了 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{Math.abs(improvementPercentage)}%</span> 的效果
        </h2>
      </div>

      {/* 主要内容 - 并排对比展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 原始提示词 */}
        <div className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <h3 className="text-sm font-light text-gray-400">优化前的提示词</h3>
              </div>
              <button
                onClick={() => handleCopy(originalPrompt, true)}
                className="p-2 rounded-lg backdrop-blur-xl bg-white/[0.03] border border-white/10 
                         hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300"
                title="复制原始提示词"
              >
                {copiedOriginal ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-gray-500 text-sm font-light leading-relaxed whitespace-pre-wrap">
              {originalPrompt}
            </div>
          </div>
        </div>

        {/* 优化后的提示词 - 轻量化的高亮设计 */}
        <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="relative group">
            {/* 更轻的渐变光晕 */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            <div className="relative backdrop-blur-xl bg-white/[0.03] border border-white/20 rounded-2xl p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-blue-400" />
                  <h3 className="text-sm font-light text-white">优化后的提示词</h3>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-light">已优化</span>
                </div>
                <button
                  onClick={() => handleCopy(optimizedPrompt, false)}
                  className="p-2 rounded-lg backdrop-blur-xl bg-white/[0.05] border border-white/20 
                           hover:bg-white/[0.08] hover:border-white/30 transition-all duration-300
                           group/btn"
                  title="复制优化后的提示词"
                >
                  {copiedOptimized ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-300 group-hover/btn:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-white text-sm font-light leading-relaxed whitespace-pre-wrap">
                {optimizedPrompt}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={onNewPrompt}
          className="px-6 py-2.5 rounded-xl backdrop-blur-xl bg-white/[0.03] border border-white/10 
                   hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300
                   text-white font-light text-sm"
        >
          再次优化
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/80 to-blue-600/80 
                   hover:from-purple-600 hover:to-blue-600 hover:shadow-lg hover:shadow-purple-500/20 
                   transition-all duration-300 text-white font-light text-sm"
        >
          返回首页
        </button>
      </div>
    </div>
  )
}