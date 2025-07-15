'use client'

import { useState, useEffect } from 'react'
import { OptimizationState, Question } from '../types'
import LoadingOptimization from './LoadingOptimization'
import StreamingOptimizationProcess from './StreamingOptimizationProcess'
import OptimizationQuestions from './OptimizationQuestions'

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
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          data: { prompt: state.originalPrompt }
        })
      })

      const result = await response.json()
      
      onStateChange({
        ...state,
        stage: 'questioning',
        promptType: result.promptType,
        questions: result.questions
      })
    } catch (error) {
      console.error('分析失败:', error)
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
            // 解析流式响应的结果
            const optimizedMatch = result.match(/【优化后的提示词】\n([\s\S]*?)(?=\n【六维度设定】|$)/)
            const optimizedPrompt = optimizedMatch ? optimizedMatch[1].trim() : result
            
            // 提取六维度
            const dimensions = extractStreamedDimensions(result)
            
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

  const dimensionMatch = response.match(/【六维度设定】[\s\S]*$/m)
  if (dimensionMatch) {
    const dimensionText = dimensionMatch[0]
    
    const patterns = {
      antiPatterns: /反模式：(.+)/,
      sceneAtmosphere: /场景氛围：(.+)/,
      styleDepth: /风格深度：(.+)/,
      coreFocus: /核心聚焦：(.+)/,
      formalConstraints: /形式约束：(.+)/,
      qualityStandards: /质量标准：(.+)/
    }

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = dimensionText.match(pattern)
      if (match) {
        if (key === 'antiPatterns') {
          dimensions[key] = [match[1].trim()]
        } else {
          dimensions[key as keyof typeof dimensions] = match[1].trim()
        }
      }
    }
  }

  return dimensions
}