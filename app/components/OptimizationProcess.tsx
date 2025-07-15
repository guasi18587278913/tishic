'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { OptimizationState, Question } from '../types'
import LoadingOptimization from './LoadingOptimization'
import StreamingOptimizationProcess from './StreamingOptimizationProcess'
import OptimizationQuestions from './OptimizationQuestions'
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
    try {
      loadingManager.show('正在分析你的需求...', 30)
      
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          data: { prompt: state.originalPrompt }
        })
      })

      const result = await response.json()
      
      loadingManager.show('分析完成，准备收集信息...', 70)
      
      onStateChange({
        ...state,
        stage: 'questioning',
        promptType: result.promptType,
        questions: result.questions
      })
      
      loadingManager.hide()
    } catch (error) {
      console.error('分析失败:', error)
      loadingManager.hide()
      
      // 使用默认值
      onStateChange({
        ...state,
        stage: 'questioning',
        promptType: 'creative',
        questions: [
          { id: '1', text: '你最想达到什么效果？', type: 'text' },
          { id: '2', text: '有什么特别想避免的？', type: 'text' },
          { id: '3', text: '有参考案例或风格偏好吗？', type: 'text' },
        ]
      })
    }
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
    if (useStreaming) {
      return (
        <StreamingOptimizationProcess 
          state={state}
          onComplete={(result) => {
            console.log('Stream complete, parsing result...')
            console.log('Result length:', result.length)
            console.log('Result preview:', result.substring(0, 300))
            
            // 解析流式响应的结果 - 尝试多种格式
            let optimizedPrompt = ''
            
            const patterns = [
              /【优化后的提示词】\s*\n([\s\S]*?)(?=\n【六维度设定】|$)/,
              /\*\*优化后的提示词\*\*\s*\n([\s\S]*?)(?=\n\*\*六维度设定\*\*|$)/,
              /优化后的提示词[:：]\s*\n([\s\S]*?)(?=\n六维度|$)/i,
              /## 优化后的提示词\s*\n([\s\S]*?)(?=\n## 六维度设定|$)/,
            ]
            
            for (const pattern of patterns) {
              const match = result.match(pattern)
              if (match && match[1].trim()) {
                optimizedPrompt = match[1].trim()
                break
              }
            }
            
            // 如果没有匹配到特定格式，尝试提取到六维度之前的内容
            if (!optimizedPrompt) {
              const sixDimPattern = /(?:【?六维度设定】?|\*\*六维度设定\*\*|## 六维度设定)/
              const sixDimIndex = result.search(sixDimPattern)
              
              if (sixDimIndex > 0) {
                optimizedPrompt = result.substring(0, sixDimIndex).trim()
              } else {
                // 最后的fallback
                optimizedPrompt = result
              }
            }
            
            // 提取六维度
            const dimensions = extractStreamedDimensions(result)
            
            console.log('Parsed prompt length:', optimizedPrompt.length)
            console.log('Parsed dimensions:', dimensions)
            
            onStateChange({
              ...state,
              stage: 'complete',
              optimizedPrompt,
              dimensions
            })
          }}
        />
      )
    } else {
      return <LoadingOptimization />
    }
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

  // 尝试多种格式
  const dimensionPatterns = [
    /【六维度设定】([\s\S]*?)$/m,
    /\*\*六维度设定\*\*([\s\S]*?)$/m,
    /## 六维度设定([\s\S]*?)$/m,
    /六维度设定[:：]([\s\S]*?)$/mi
  ]
  
  let dimensionText = ''
  for (const pattern of dimensionPatterns) {
    const match = response.match(pattern)
    if (match) {
      dimensionText = match[1] || match[0]
      break
    }
  }
  
  if (!dimensionText) {
    return dimensions
  }
    
  // 解析每个维度 - 支持多种格式
  const patterns = {
    antiPatterns: [
      /[-•\*]?\s*反模式[:：]\s*(.+)/,
      /[-•\*]?\s*避免[:：]\s*(.+)/,
      /[-•\*]?\s*不要[:：]\s*(.+)/
    ],
    sceneAtmosphere: [
      /[-•\*]?\s*场景氛围[:：]\s*(.+)/,
      /[-•\*]?\s*场景[:：]\s*(.+)/,
      /[-•\*]?\s*背景[:：]\s*(.+)/
    ],
    styleDepth: [
      /[-•\*]?\s*风格深度[:：]\s*(.+)/,
      /[-•\*]?\s*风格[:：]\s*(.+)/,
      /[-•\*]?\s*表达方式[:：]\s*(.+)/
    ],
    coreFocus: [
      /[-•\*]?\s*核心聚焦[:：]\s*(.+)/,
      /[-•\*]?\s*核心[:：]\s*(.+)/,
      /[-•\*]?\s*聚焦[:：]\s*(.+)/
    ],
    formalConstraints: [
      /[-•\*]?\s*形式约束[:：]\s*(.+)/,
      /[-•\*]?\s*形式[:：]\s*(.+)/,
      /[-•\*]?\s*约束[:：]\s*(.+)/
    ],
    qualityStandards: [
      /[-•\*]?\s*质量标准[:：]\s*(.+)/,
      /[-•\*]?\s*质量[:：]\s*(.+)/,
      /[-•\*]?\s*标准[:：]\s*(.+)/
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