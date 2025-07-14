'use client'

import { useState, useEffect } from 'react'
import { OptimizationState } from '../types'

interface StreamingOptimizationProcessProps {
  state: OptimizationState
  onComplete: (result: string) => void
}

export default function StreamingOptimizationProcess({ 
  state, 
  onComplete 
}: StreamingOptimizationProcessProps) {
  const [streamedContent, setStreamedContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    if (state.stage === 'optimizing' && !isStreaming) {
      startStreaming()
    }
  }, [state.stage])

  const startStreaming = async () => {
    setIsStreaming(true)
    let fullContent = ''

    try {
      const response = await fetch('/api/optimize/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalPrompt: state.originalPrompt,
          promptType: state.promptType,
          answers: state.answers,
        }),
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader available')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              onComplete(fullContent)
              return
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                fullContent += parsed.content
                setStreamedContent(fullContent)
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error)
    } finally {
      setIsStreaming(false)
    }
  }

  if (state.stage !== 'optimizing') return null

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6 glass-effect animate-slide-up">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">正在优化中...</h3>
          {isStreaming && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-pulse mr-2">●</div>
              实时生成中
            </div>
          )}
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ 
              width: streamedContent.length > 0 ? '100%' : '0%',
              animation: isStreaming ? 'pulse 2s infinite' : 'none'
            }}
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
        {streamedContent ? (
          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
            {streamedContent}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-gray-600 animate-pulse ml-1" />
            )}
          </pre>
        ) : (
          <p className="text-gray-500 italic">等待响应开始...</p>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 <strong>流式响应已启用</strong> - Claude Opus 4 正在深度思考并实时显示结果
        </p>
      </div>
    </div>
  )
}