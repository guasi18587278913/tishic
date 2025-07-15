'use client'

import { useState, useEffect } from 'react'
import { OptimizationState } from '../types'
import PromptInput from './PromptInput'
import OptimizationQuestions from './OptimizationQuestions'
import OptimizationProcess from './OptimizationProcess'
import OptimizedResult from './OptimizedResult'

interface OptimizationFlowProps {
  optimizationState: OptimizationState
  setOptimizationState: (state: OptimizationState) => void
  enableStreaming: boolean
  setEnableStreaming: (enabled: boolean) => void
}

export default function OptimizationFlow({
  optimizationState,
  setOptimizationState,
  enableStreaming,
  setEnableStreaming,
}: OptimizationFlowProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handlePromptSubmit = (prompt: string) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setOptimizationState({
        ...optimizationState,
        originalPrompt: prompt,
        stage: 'analyzing',
      })
      setIsTransitioning(false)
    }, 300)
  }

  // 计算当前步骤
  const getStepInfo = () => {
    switch (optimizationState.stage) {
      case 'input':
        return { step: 1, total: 4, title: '输入初始想法' }
      case 'analyzing':
        return { step: 2, total: 4, title: '分析中...' }
      case 'questioning':
        return { step: 2, total: 4, title: '优化信息收集' }
      case 'optimizing':
        return { step: 3, total: 4, title: '生成优化结果' }
      case 'complete':
        return { step: 4, total: 4, title: '优化完成' }
      default:
        return { step: 1, total: 4, title: '开始' }
    }
  }

  const stepInfo = getStepInfo()

  return (
    <section id="demo" className="min-h-screen flex flex-col">
      {/* 固定顶部标题和进度 */}
      <div className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">智能优化助手</span>
            </h2>
            <p className="text-lg text-gray-400">让每一个提示词都达到最佳效果</p>
          </div>

          {/* 步骤指示器 */}
          {optimizationState.stage !== 'input' && (
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-white">{stepInfo.title}</h3>
                <span className="text-sm text-gray-400">
                  步骤 {stepInfo.step} / {stepInfo.total}
                </span>
              </div>
              <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(stepInfo.step / stepInfo.total) * 100}%` }}
                />
                {/* 动画光效 */}
                <div 
                  className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                  style={{ left: `${(stepInfo.step / stepInfo.total) * 100 - 5}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 主内容区域 - 固定高度，内容切换 */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-4xl">
          <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
            {/* 输入阶段 */}
            {optimizationState.stage === 'input' && (
              <div className="glass-card rounded-2xl p-8 animate-fade-in">
                <PromptInput 
                  onSubmit={handlePromptSubmit}
                  disabled={false}
                />
              </div>
            )}

            {/* 问题收集阶段 */}
            {optimizationState.stage === 'questioning' && (
              <div className="glass-card rounded-2xl p-8 animate-slide-in">
                <OptimizationProcess 
                  state={optimizationState}
                  onStateChange={setOptimizationState}
                  useStreaming={enableStreaming}
                />
              </div>
            )}

            {/* 分析/优化阶段 */}
            {(optimizationState.stage === 'analyzing' || optimizationState.stage === 'optimizing') && (
              <div className="glass-card rounded-2xl p-8 animate-fade-in">
                <OptimizationProcess 
                  state={optimizationState}
                  onStateChange={setOptimizationState}
                  useStreaming={enableStreaming}
                />
              </div>
            )}

            {/* 结果展示阶段 */}
            {optimizationState.stage === 'complete' && optimizationState.optimizedPrompt && (
              <div className="glass-card rounded-2xl p-8 neon-teal animate-slide-in">
                <OptimizedResult 
                  result={optimizationState.optimizedPrompt}
                  originalPrompt={optimizationState.originalPrompt}
                  dimensions={optimizationState.dimensions}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部快捷键提示 */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="glass rounded-full px-4 py-2 text-xs text-gray-400 flex items-center gap-4">
          <span><kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">Enter</kbd> 确认</span>
          <span><kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">ESC</kbd> 返回</span>
        </div>
      </div>
    </section>
  )
}