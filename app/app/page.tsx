'use client'

import { useState } from 'react'
import UnifiedEntry from '../components/UnifiedEntry'
import PromptGenerator from '../components/PromptGenerator'
import OptimizationFlow from '../components/OptimizationFlow'
import { AppMode, OptimizationState } from '../types'

export default function AppPage() {
  const [mode, setMode] = useState<AppMode>('unified')
  const [initialInput, setInitialInput] = useState<string>('')
  const [enableStreaming, setEnableStreaming] = useState(true)
  const [optimizationState, setOptimizationState] = useState<OptimizationState>({
    originalPrompt: '',
    stage: 'input',
    questions: [],
    answers: {},
    optimizedPrompt: ''
  })

  const handleModeSelect = (selectedMode: 'generate' | 'optimize') => {
    setMode(selectedMode)
    if (selectedMode === 'optimize' && initialInput) {
      // 如果有初始输入，设置到优化状态中
      setOptimizationState({
        ...optimizationState,
        originalPrompt: initialInput,
        stage: 'input'
      })
    }
  }

  const handleGenerateComplete = (generatedPrompt: string) => {
    // 生成完成后，自动进入优化模式
    setInitialInput(generatedPrompt)
    setOptimizationState({
      ...optimizationState,
      originalPrompt: generatedPrompt,
      stage: 'input'
    })
    setMode('optimize')
  }

  const handleOptimizeComplete = () => {
    // 优化完成后的处理
    // 可以添加分享、保存等功能
  }

  const handleBack = () => {
    setMode('unified')
    setInitialInput('')
    // 重置优化状态
    setOptimizationState({
      originalPrompt: '',
      stage: 'input',
      questions: [],
      answers: {},
      optimizedPrompt: ''
    })
  }

  // 根据模式渲染不同的组件
  switch (mode) {
    case 'unified':
      return <UnifiedEntry onModeSelect={handleModeSelect} />
    
    case 'generate':
      return (
        <PromptGenerator
          initialInput=""
          onGenerate={handleGenerateComplete}
          onBack={handleBack}
        />
      )
    
    case 'optimize':
      return (
        <div className="min-h-screen relative overflow-hidden bg-black">
          {/* 背景光晕 - 呼应入口按钮的紫蓝色调 */}
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-purple-500/[0.08] rounded-full filter blur-[200px]" />
            <div className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] bg-blue-500/[0.08] rounded-full filter blur-[200px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/[0.05] to-blue-600/[0.05] rounded-full filter blur-[250px]" />
          </div>

          <div className="relative z-10 min-h-screen">
            {/* 头部导航 */}
            <div className="absolute top-0 left-0 right-0 p-8">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="text-gray-400 hover:text-white transition-colors font-light"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  返回
                </button>
                <div className="flex items-center gap-2 text-sm font-light text-gray-400">
                  <i className="fas fa-wand-magic-sparkles text-gray-400"></i>
                  <span>提示词优化器</span>
                </div>
              </div>
            </div>

            <OptimizationFlow
              optimizationState={optimizationState}
              setOptimizationState={setOptimizationState}
              enableStreaming={enableStreaming}
              setEnableStreaming={setEnableStreaming}
            />
          </div>
        </div>
      )
    
    default:
      return null
  }
}