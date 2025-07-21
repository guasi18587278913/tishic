'use client'

import { useState, useCallback, useEffect } from 'react'
import { TaskType, OptimizationResult, OptimizationMode, SmartSuggestions } from '../types/index'
import { identifyTaskType } from '../lib/prompt-optimizer-v2'
import { generateSmartSuggestions, applySmartSuggestions, deepCustomizePrompt, DeepCustomizationOptions } from '../lib/prompt-optimizer-v4'
import { MODEL_CONFIGS } from '../lib/model-config'
import OptimizationPreview from './OptimizationPreview'
import TaskTypeSelector from './TaskTypeSelector'
import ModelSelector from './ModelSelector'
import OptimizationModeSelector from './OptimizationModeSelector'
import SmartSuggestionsCard from './SmartSuggestionsCard'
import DeepCustomizationCard from './DeepCustomizationCard'

interface SmartPromptOptimizerProps {
  onOptimizationComplete?: (result: OptimizationResult) => void
}

export default function SmartPromptOptimizer({ onOptimizationComplete }: SmartPromptOptimizerProps) {
  const [input, setInput] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [detectedTaskType, setDetectedTaskType] = useState<TaskType | null>(null)
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | null>(null)
  const [selectedModel, setSelectedModel] = useState('claude-opus-4')
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const [optimizationMode, setOptimizationMode] = useState<OptimizationMode>('smart')
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestions | null>(null)
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showDeepCustomization, setShowDeepCustomization] = useState(false)
  const [deepCustomOptions, setDeepCustomOptions] = useState<DeepCustomizationOptions | null>(null)

  // Auto-detect task type as user types
  useEffect(() => {
    if (input.trim().length > 10) {
      const result = identifyTaskType(input)
      setDetectedTaskType(result.type)
      if (!selectedTaskType) {
        setSelectedTaskType(result.type)
      }
    }
  }, [input, selectedTaskType])

  const handleOptimize = async () => {
    if (!input.trim() || isOptimizing) return

    // Handle different optimization modes
    if (optimizationMode === 'smart' && !smartSuggestions) {
      // Smart mode: generate suggestions first
      setIsGeneratingSuggestions(true)
      setShowSuggestions(true)
      
      try {
        const suggestions = await generateSmartSuggestions(input)
        setSmartSuggestions(suggestions)
      } catch (error) {
        console.error('Error generating suggestions:', error)
        // Fallback to instant mode if suggestions fail
        await performOptimization()
      } finally {
        setIsGeneratingSuggestions(false)
      }
      return
    } else if (optimizationMode === 'deep') {
      // Deep mode: show customization options
      setShowDeepCustomization(true)
      return
    }

    // For instant mode or after suggestions confirmed
    await performOptimization()
  }

  const performOptimization = async (customSuggestions?: SmartSuggestions, customOptions?: DeepCustomizationOptions) => {
    setIsOptimizing(true)
    setShowPreview(true)
    setShowSuggestions(false)
    setShowDeepCustomization(false)

    try {
      let optimizedPrompt: string
      const taskType = selectedTaskType || detectedTaskType || 'general'
      
      if (optimizationMode === 'deep' && deepCustomOptions && smartSuggestions) {
        // 深度定制模式
        optimizedPrompt = await deepCustomizePrompt(input, smartSuggestions, deepCustomOptions, taskType)
      } else if (customSuggestions && optimizationMode === 'smart') {
        // 使用智能建议生成优化提示词
        optimizedPrompt = await applySmartSuggestions(input, customSuggestions, taskType)
      } else {
        // 使用原有API优化
        const response = await fetch('/api/optimize/v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'optimize',
            prompt: input,
            answers: {}
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error:', response.status, errorText)
          throw new Error(`Optimization failed: ${response.status}`)
        }

        const result = await response.json()
        optimizedPrompt = result.optimizedPrompt
      }
      
      const optimizationResult: OptimizationResult = {
        original: input,
        optimized: optimizedPrompt,
        taskType: taskType,
        timestamp: new Date().toISOString()
      }

      setOptimizationResult(optimizationResult)
      
      if (onOptimizationComplete) {
        onOptimizationComplete(optimizationResult)
      }
    } catch (error) {
      console.error('Optimization error:', error)
      // Fallback to a meaningful error state
      setOptimizationResult({
        original: input,
        optimized: '优化失败，请重试',
        taskType: selectedTaskType || 'general',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleSuggestionsConfirm = (updatedSuggestions: SmartSuggestions) => {
    setSmartSuggestions(updatedSuggestions)
    performOptimization(updatedSuggestions)
  }

  const handleSuggestionsCancel = () => {
    setShowSuggestions(false)
    setSmartSuggestions(null)
  }

  const handleDeepCustomizationConfirm = async (options: DeepCustomizationOptions) => {
    setDeepCustomOptions(options)
    
    // Generate suggestions for deep mode if not already generated
    if (!smartSuggestions) {
      setIsGeneratingSuggestions(true)
      try {
        const suggestions = await generateSmartSuggestions(input)
        setSmartSuggestions(suggestions)
        await performOptimization(suggestions, options)
      } catch (error) {
        console.error('Error generating suggestions:', error)
        // Fallback to basic optimization
        await performOptimization()
      } finally {
        setIsGeneratingSuggestions(false)
      }
    } else {
      await performOptimization(smartSuggestions, options)
    }
  }

  const handleDeepCustomizationCancel = () => {
    setShowDeepCustomization(false)
    setDeepCustomOptions(null)
  }

  const handleCopy = useCallback(async () => {
    if (optimizationResult?.optimized) {
      await navigator.clipboard.writeText(optimizationResult.optimized)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [optimizationResult])

  const handleReset = () => {
    setInput('')
    setOptimizationResult(null)
    setShowPreview(false)
    setSelectedTaskType(null)
    setDetectedTaskType(null)
    setSmartSuggestions(null)
    setShowSuggestions(false)
    setDeepCustomOptions(null)
    setShowDeepCustomization(false)
  }

  return (
    <div className="w-full">
      {/* Title Section */}
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-4xl font-light text-white mb-2">
          智能提示词优化器
        </h1>
        <p className="text-gray-300 text-base">
          基于 AI 深度理解，智能识别任务类型，一键生成专业提示词
        </p>
      </div>

      {/* Main Input Area */}
      <div className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 mb-6">
        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            输入你的需求或原始提示词
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例如：整理周报、写一篇关于AI的文章、分析市场数据..."
            className="w-full h-32 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 
                     text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-gray-800/70
                     focus:border-purple-500/50 transition-all duration-300 resize-none custom-scrollbar"
            disabled={isOptimizing}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{input.length} 字符</span>
            {detectedTaskType && (
              <span className="text-xs text-purple-400">
                检测到任务类型：{getTaskTypeLabel(detectedTaskType)}
              </span>
            )}
          </div>
        </div>

        {/* Optimization Mode Selector */}
        <OptimizationModeSelector
          selectedMode={optimizationMode}
          onModeChange={setOptimizationMode}
          disabled={isOptimizing || isGeneratingSuggestions}
        />

        {/* Task Type Selector */}
        <TaskTypeSelector
          detectedType={detectedTaskType}
          selectedType={selectedTaskType}
          onTypeChange={setSelectedTaskType}
        />

        {/* Model Selector - Show for instant mode */}
        {optimizationMode === 'instant' && (
          <div className="mb-6">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleOptimize}
            disabled={!input.trim() || isOptimizing}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600/90 to-blue-600/90 
                     text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed
                     hover:from-purple-600 hover:to-blue-600 transition-all duration-300
                     hover:shadow-lg hover:shadow-purple-500/25"
          >
            {isOptimizing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                优化中...
              </span>
            ) : (
              '开始优化'
            )}
          </button>
          
          {optimizationResult && (
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl bg-gray-800/50 border border-gray-700 
                       text-gray-200 font-medium hover:bg-gray-800/70 hover:border-gray-600
                       hover:text-white transition-all duration-300"
            >
              重新开始
            </button>
          )}
        </div>
      </div>

      {/* Smart Suggestions Card */}
      {showSuggestions && (
        <SmartSuggestionsCard
          suggestions={smartSuggestions || {
            avoidances: [],
            style: '',
            focus: '',
            context: ''
          }}
          onConfirm={handleSuggestionsConfirm}
          onCancel={handleSuggestionsCancel}
          isLoading={isGeneratingSuggestions}
        />
      )}

      {/* Deep Customization Card */}
      {showDeepCustomization && (
        <DeepCustomizationCard
          onConfirm={handleDeepCustomizationConfirm}
          onCancel={handleDeepCustomizationCancel}
        />
      )}

      {/* Optimization Preview */}
      {showPreview && !showSuggestions && !showDeepCustomization && (
        <OptimizationPreview
          isOptimizing={isOptimizing}
          result={optimizationResult}
          onCopy={handleCopy}
          copied={copied}
        />
      )}
    </div>
  )
}

function getTaskTypeLabel(type: TaskType): string {
  const labels: Record<TaskType, string> = {
    tool: '工具类',
    creative: '创作类',
    analytical: '分析类',
    generative: '生成类',
    general: '通用类'
  }
  return labels[type] || '通用类'
}