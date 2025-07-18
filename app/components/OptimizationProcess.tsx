'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { OptimizationState, Question } from '../types'
import LoadingOptimization from './LoadingOptimization'
import StreamingOptimizationProcess from './StreamingOptimizationProcess'
import OptimizationQuestions from './OptimizationQuestions'
import InstantOptimization from './InstantOptimization'
import { debounce } from '../lib/api-utils'
import { loadingManager } from './GlobalLoadingIndicator'

interface OptimizationProcessProps {
  state: OptimizationState
  onStateChange: (state: OptimizationState) => void
  useStreaming?: boolean
}

export default function OptimizationProcess({ state, onStateChange, useStreaming = true }: OptimizationProcessProps) {
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  useEffect(() => {
    if (state.stage === 'analyzing') {
      // 调用API分析提示词
      analyzePrompt()
    }
  }, [state.stage])

  const analyzePrompt = async () => {
    // 直接跳转到优化阶段，使用即时优化组件
    onStateChange({
      ...state,
      stage: 'optimizing'
    })
  }

  const handleAnswerSubmit = () => {
    const newAnswers = {
      ...state.answers,
      [state.questions[currentQuestionIndex].id]: currentAnswer
    }

    if (currentQuestionIndex < state.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer('')
      onStateChange({
        ...state,
        answers: newAnswers
      })
    } else {
      // 所有问题回答完毕，开始优化
      onStateChange({
        ...state,
        answers: newAnswers,
        stage: 'optimizing'
      })
      // 如果启用流式响应，不在这里调用API
      if (!useStreaming) {
        optimizePrompt(state, newAnswers)
      }
    }
  }

  const optimizePrompt = async (currentState: OptimizationState, answers: Record<string, string>) => {
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize',
          data: {
            originalPrompt: currentState.originalPrompt,
            promptType: currentState.promptType,
            answers
          }
        })
      })

      const result = await response.json()
      
      onStateChange({
        ...currentState,
        stage: 'complete',
        optimizedPrompt: result.optimizedPrompt,
        dimensions: result.dimensions,
        answers
      })
    } catch (error) {
      console.error('优化失败:', error)
      // 使用默认优化结果
      onStateChange({
        ...currentState,
        stage: 'complete',
        optimizedPrompt: `优化后的提示词示例：

写一篇关于AI发展的深度分析文章，要求如下：

1. 避免使用"人工智能将改变世界"这类空泛论述，不要罗列技术术语来显示专业性

2. 以一个具体的生活场景切入（如清晨的智能闹钟唤醒），通过微观视角折射宏观变革

3. 采用"技术民族志"的写作风格——像人类学家观察部落那样，冷静记录AI如何悄然改变人类行为模式

4. 聚焦探讨：AI发展中"效率"与"意义"的张力——当AI让一切变得高效，人类如何重新定义生活的意义

5. 文章结构：3个部分，每部分500-600字，用一个贯穿全文的隐喻（如"驯化"）串联

6. 成功标准：读完后，读者应该对日常生活中的AI产生新的觉察，而非只是了解技术趋势`,
        dimensions: {
          antiPatterns: ['避免空泛论述', '不要技术堆砌'],
          sceneAtmosphere: '清晨智能闹钟场景，微观视角',
          styleDepth: '技术民族志风格，冷静观察记录',
          coreFocus: '效率与意义的张力探讨',
          formalConstraints: '3部分，每部分500-600字，贯穿隐喻',
          qualityStandards: '引发对日常AI的新觉察'
        }
      })
    }
  }

  if (state.stage === 'analyzing') {
    return (
      <div className="glass-card rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mr-4"></div>
          <p className="text-lg text-gray-300">正在分析你的需求...</p>
        </div>
      </div>
    )
  }

  if (state.stage === 'questioning') {
    return (
      <div className="animate-slide-up">
        <OptimizationQuestions
          questions={state.questions}
          originalPrompt={state.originalPrompt}
          promptType={state.promptType}
          onComplete={(allAnswers) => {
            // All questions answered, start optimization
            onStateChange({
              ...state,
              answers: allAnswers,
              stage: 'optimizing'
            })
            // If streaming is disabled, call API
            if (!useStreaming) {
              optimizePrompt(state, allAnswers)
            }
          }}
          onBack={() => {
            // Go back to input stage
            onStateChange({
              ...state,
              stage: 'input'
            })
          }}
        />
      </div>
    )
  }

  if (state.stage === 'optimizing') {
    return (
      <InstantOptimization 
        originalPrompt={state.originalPrompt}
        onComplete={(optimizedPrompt) => {
          // 优化完成后更新状态
          onStateChange({
            ...state,
            stage: 'complete',
            optimizedPrompt: optimizedPrompt,
            dimensions: {
              antiPatterns: ['避免空泛论述', '不要技术堆砌'],
              sceneAtmosphere: '具体场景切入，微观视角',
              styleDepth: '深度分析，专业风格',
              coreFocus: '核心问题聚焦',
              formalConstraints: '结构清晰，逻辑严密',
              qualityStandards: '实用性强，易于理解'
            }
          })
        }}
      />
    )
  }

  return null
}

// 从流式响应中提取六维度
function extractStreamedDimensions(response: string): any {
  const dimensions: any = {
    antiPatterns: [],
    sceneAtmosphere: '',
    styleDepth: '',
    coreFocus: '',
    formalConstraints: '',
    qualityStandards: ''
  }

  // 尝试多种格式，更灵活的匹配
  const dimensionPatterns = [
    /【六维度设定】([\s\S]*?)$/m,
    /\*\*六维度设定\*\*([\s\S]*?)$/m,
    /## 六维度设定([\s\S]*?)$/m,
    /六维度设定[:：]([\s\S]*?)$/mi,
    // 新增更灵活的模式
    /【?六维度[设定]*】?[：:]*([\s\S]*?)$/mi,
    /\*\*六维度[设定]*\*\*[：:]*([\s\S]*?)$/mi,
    /## 六维度[设定]*[：:]*([\s\S]*?)$/mi,
  ]
  
  let dimensionText = ''
  for (const pattern of dimensionPatterns) {
    const match = response.match(pattern)
    if (match) {
      dimensionText = match[1] || match[0]
      console.log('Matched dimension pattern:', pattern.toString())
      break
    }
  }
  
  if (!dimensionText) {
    console.log('No dimension section found in response')
    return dimensions
  }
    
  // 解析每个维度 - 支持多种格式
  const patterns = {
    antiPatterns: [
      /[-•\*]?\s*反模式[设定]*[:：]\s*(.+)/i,
      /[-•\*]?\s*避免[:：]\s*(.+)/i,
      /[-•\*]?\s*不要[:：]\s*(.+)/i,
      /[-•\*]?\s*反模式[设定]*\s*[：:]\s*(.+)/i,
    ],
    sceneAtmosphere: [
      /[-•\*]?\s*场景[与和]?氛围[:：]\s*(.+)/i,
      /[-•\*]?\s*场景[:：]\s*(.+)/i,
      /[-•\*]?\s*背景[:：]\s*(.+)/i,
      /[-•\*]?\s*场景[与和]?氛围\s*[：:]\s*(.+)/i,
    ],
    styleDepth: [
      /[-•\*]?\s*风格[与和]?深度[:：]\s*(.+)/i,
      /[-•\*]?\s*风格[:：]\s*(.+)/i,
      /[-•\*]?\s*表达方式[:：]\s*(.+)/i,
      /[-•\*]?\s*风格[与和]?深度\s*[：:]\s*(.+)/i,
    ],
    coreFocus: [
      /[-•\*]?\s*核心聚焦[:：]\s*(.+)/i,
      /[-•\*]?\s*核心[:：]\s*(.+)/i,
      /[-•\*]?\s*聚焦[:：]\s*(.+)/i,
      /[-•\*]?\s*核心聚焦\s*[：:]\s*(.+)/i,
    ],
    formalConstraints: [
      /[-•\*]?\s*形式约束[:：]\s*(.+)/i,
      /[-•\*]?\s*形式[:：]\s*(.+)/i,
      /[-•\*]?\s*约束[:：]\s*(.+)/i,
      /[-•\*]?\s*形式约束\s*[：:]\s*(.+)/i,
    ],
    qualityStandards: [
      /[-•\*]?\s*质量标准[:：]\s*(.+)/i,
      /[-•\*]?\s*质量[:：]\s*(.+)/i,
      /[-•\*]?\s*标准[:：]\s*(.+)/i,
      /[-•\*]?\s*质量标准\s*[：:]\s*(.+)/i,
    ]
  }

  for (const [key, patternList] of Object.entries(patterns)) {
    for (const pattern of patternList) {
      const match = dimensionText.match(pattern)
      if (match) {
        const value = match[1].trim()
        if (key === 'antiPatterns') {
          dimensions[key] = [value]
        } else {
          dimensions[key as keyof typeof dimensions] = value
        }
        break
      }
    }
  }

  return dimensions
}