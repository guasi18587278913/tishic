'use client'

import { useState, useEffect, useRef } from 'react'
import { OptimizationState } from '../types'
import PromptInput from './PromptInput'
import OptimizationQuestions from './OptimizationQuestions'
import OptimizationProcess from './OptimizationProcess'
import OptimizationComplete from './OptimizationComplete'
import { analyzePromptType } from '../lib/prompt-optimizer'

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 清理 timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handlePromptSubmit = (prompt: string) => {
    // 清理之前的 timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // 检查是否是快速优化
    const isQuickOptimize = prompt.includes('__QUICK_OPTIMIZE__')
    const cleanPrompt = prompt.replace('__QUICK_OPTIMIZE__', '').trim()
    
    // 验证输入
    if (!cleanPrompt) {
      setOptimizationState({
        ...optimizationState,
        error: {
          message: '请输入你的初始想法',
          retryable: false
        },
        stage: 'error'
      })
      return
    }
    
    setIsTransitioning(true)
    timeoutRef.current = setTimeout(() => {
      if (isQuickOptimize) {
        // 快速优化：跳过问题收集，直接进入优化阶段
        const promptType = analyzePromptType(cleanPrompt)
        setOptimizationState({
          ...optimizationState,
          originalPrompt: cleanPrompt,
          stage: 'optimizing',
          promptType: promptType,
          questions: [],
          answers: {}, // 使用空答案，API会使用智能默认值
          error: undefined
        })
      } else {
        // 常规流程
        setOptimizationState({
          ...optimizationState,
          originalPrompt: cleanPrompt,
          stage: 'analyzing',
          error: undefined
        })
      }
      setIsTransitioning(false)
    }, 300)
  }

  // 计算当前步骤
  const getStepInfo = (): { step: number; total: number; title: string } => {
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
      case 'error':
        return { step: 1, total: 4, title: '出现错误' }
      default:
        return { step: 1, total: 4, title: '开始' }
    }
  }

  const stepInfo = getStepInfo()

  return (
    <div className="min-h-screen flex flex-col">
      {/* 步骤指示器 - 只在优化完成页面不显示 */}
      {optimizationState.stage !== 'input' && optimizationState.stage !== 'complete' && (
        <div className="pt-8 pb-4 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-light text-white">{stepInfo.title}</h3>
                <span className="text-sm font-light text-gray-400">
                  步骤 {stepInfo.step} / {stepInfo.total}
                </span>
              </div>
              <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(stepInfo.step / stepInfo.total) * 100}%` }}
                />
                {/* 动画光效 */}
                <div 
                  className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
                  style={{ left: `${(stepInfo.step / stepInfo.total) * 100 - 5}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full">
          <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
            {/* 输入阶段 - 不需要额外容器 */}
            {optimizationState.stage === 'input' && (
              <PromptInput 
                onSubmit={handlePromptSubmit}
                disabled={false}
              />
            )}

            {/* 问题收集阶段 */}
            {optimizationState.stage === 'questioning' && (
              <div className="max-w-4xl mx-auto backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-8 animate-slide-in">
                <OptimizationProcess 
                  state={optimizationState}
                  onStateChange={setOptimizationState}
                  useStreaming={enableStreaming}
                />
              </div>
            )}

            {/* 分析/优化阶段 */}
            {(optimizationState.stage === 'analyzing' || optimizationState.stage === 'optimizing') && (
              <div className="max-w-4xl mx-auto backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-8 animate-fade-in">
                <OptimizationProcess 
                  state={optimizationState}
                  onStateChange={setOptimizationState}
                  useStreaming={enableStreaming}
                />
              </div>
            )}

            {/* 结果展示阶段 */}
            {optimizationState.stage === 'complete' && optimizationState.optimizedPrompt && (
              <OptimizationComplete 
                originalPrompt={optimizationState.originalPrompt}
                optimizedPrompt={optimizationState.optimizedPrompt}
                onReoptimize={() => {
                  setOptimizationState({
                    ...optimizationState,
                    stage: 'input',
                    optimizedPrompt: null
                  })
                }}
                onNewPrompt={() => {
                  setOptimizationState({
                    stage: 'input',
                    originalPrompt: '',
                    promptType: null,
                    questions: [],
                    userAnswers: {},
                    optimizedPrompt: null,
                    isOptimizing: false,
                    dimensions: {}
                  })
                }}
              />
            )}
            
            {/* 结果展示阶段 - 但没有优化结果的情况 */}
            {optimizationState.stage === 'complete' && !optimizationState.optimizedPrompt && (
              <div className="max-w-4xl mx-auto backdrop-blur-xl bg-white/[0.03] border border-red-500/20 rounded-2xl p-8 animate-slide-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-red-400"></i>
                  </div>
                  <h3 className="text-xl font-light text-white">优化结果解析失败</h3>
                </div>
                <p className="text-gray-400 font-light mb-4">
                  抱歉，优化过程已完成但无法正确解析结果。这可能是由于API响应格式不符合预期。
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white font-light hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
                >
                  重新开始
                </button>
              </div>
            )}
            
            {/* 错误状态 */}
            {optimizationState.stage === 'error' && optimizationState.error && (
              <div className="max-w-4xl mx-auto backdrop-blur-xl bg-white/[0.03] border border-red-500/30 rounded-2xl p-8 animate-slide-in">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-2xl text-red-500/70"></i>
                  </div>
                  <h3 className="text-xl font-light mb-2 text-red-400">操作失败</h3>
                  <p className="text-gray-400 font-light mb-6">{optimizationState.error.message}</p>
                  {optimizationState.error.retryable !== false && (
                    <button
                      onClick={() => setOptimizationState({ ...optimizationState, stage: 'input', error: undefined })}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white font-light hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
                    >
                      重新开始
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}