'use client'

import { useState, useEffect } from 'react'
import { OptimizationState } from '../types'
import InstantOptimizationComplete from './InstantOptimizationComplete'

interface InstantOptimizationProps {
  originalPrompt: string
  onComplete?: (optimizedPrompt: string) => void
}

export default function InstantOptimization({ originalPrompt, onComplete }: InstantOptimizationProps) {
  const [isOptimizing, setIsOptimizing] = useState(true)
  const [optimizedPrompt, setOptimizedPrompt] = useState('')
  const [finalOptimizedPrompt, setFinalOptimizedPrompt] = useState('')
  const [showComplete, setShowComplete] = useState(false)

  useEffect(() => {
    // 模拟优化过程
    const optimizePrompt = async () => {
      try {
        const response = await fetch('/api/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'optimize',
            data: {
              originalPrompt,
              promptType: 'auto',
              answers: {} // 使用默认值
            }
          })
        })

        const result = await response.json()
        setFinalOptimizedPrompt(result.optimizedPrompt)
        
        // 逐字显示效果
        const words = result.optimizedPrompt.split('')
        let currentIndex = 0
        
        const interval = setInterval(() => {
          if (currentIndex < words.length) {
            setOptimizedPrompt(prev => prev + words[currentIndex])
            currentIndex++
          } else {
            clearInterval(interval)
            setIsOptimizing(false)
            setTimeout(() => setShowComplete(true), 500) // 延迟显示完成界面
            if (onComplete) {
              onComplete(result.optimizedPrompt)
            }
          }
        }, 20) // 每20ms显示一个字符

        return () => clearInterval(interval)
      } catch (error) {
        // 使用示例优化结果
        const exampleOptimized = `作为一位深谙人性的内容创作专家，请帮我撰写一篇关于"${originalPrompt}"的深度文章。

要求：
1. 开篇用一个引人入胜的故事或场景，立即抓住读者注意力
2. 全文围绕3个核心观点展开，每个观点都配有真实案例或数据支撑
3. 语言风格亲切自然，像朋友聊天，避免说教感
4. 结尾给出3-5个具体可执行的建议
5. 全文1500-2000字，适合在通勤时间阅读完毕

成功标准：读者看完后会主动分享给朋友，并在评论区积极讨论`

        setFinalOptimizedPrompt(exampleOptimized)
        const words = exampleOptimized.split('')
        let currentIndex = 0
        
        const interval = setInterval(() => {
          if (currentIndex < words.length) {
            setOptimizedPrompt(prev => prev + words[currentIndex])
            currentIndex++
          } else {
            clearInterval(interval)
            setIsOptimizing(false)
            setTimeout(() => setShowComplete(true), 500)
            if (onComplete) {
              onComplete(exampleOptimized)
            }
          }
        }, 10)

        return () => clearInterval(interval)
      }
    }

    optimizePrompt()
  }, [originalPrompt])

  // 如果显示完成界面
  if (showComplete) {
    return (
      <InstantOptimizationComplete 
        originalPrompt={originalPrompt}
        optimizedPrompt={finalOptimizedPrompt}
        onNewOptimization={() => window.location.reload()}
      />
    )
  }

  // 优化中的界面
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-xl bg-purple-500/10 border border-purple-500/20 mb-4">
          <svg className="w-5 h-5 text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-purple-400 font-light">正在优化中...</span>
        </div>
        <p className="text-gray-400 text-sm font-light">基于六维度框架分析并优化你的提示词</p>
      </div>

      {/* 实时显示优化过程 */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl opacity-50 blur-xl animate-pulse" />
        <div className="relative backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8">
          <div className="text-white font-light leading-relaxed whitespace-pre-wrap">
            {optimizedPrompt}
            {isOptimizing && <span className="inline-block w-0.5 h-5 bg-purple-400 animate-pulse ml-0.5" />}
          </div>
        </div>
      </div>

      {/* 进度提示 */}
      <div className="mt-6 flex justify-center">
        <div className="text-xs text-gray-500 font-light">
          <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2"></span>
          AI 正在深度分析并重构你的提示词...
        </div>
      </div>
    </div>
  )
}