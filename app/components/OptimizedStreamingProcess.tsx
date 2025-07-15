'use client'

import { useState, useEffect, useRef } from 'react'
import { OptimizationState } from '../types'
import { StreamProcessor } from '../lib/streaming-utils'

interface OptimizedStreamingProcessProps {
  state: OptimizationState
  onComplete: (result: string) => void
  onError?: (error: Error) => void
}

export default function OptimizedStreamingProcess({ 
  state, 
  onComplete,
  onError 
}: OptimizedStreamingProcessProps) {
  const [streamedContent, setStreamedContent] = useState('')
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'connecting' | 'streaming' | 'complete' | 'error'>('connecting')
  const abortControllerRef = useRef<AbortController | null>(null)
  const streamProcessorRef = useRef<StreamProcessor | null>(null)

  useEffect(() => {
    if (state.stage === 'optimizing') {
      startStreaming()
    }

    return () => {
      // 清理：取消正在进行的请求
      abortControllerRef.current?.abort()
    }
  }, [state.stage])

  const startStreaming = async () => {
    try {
      setStatus('connecting')
      abortControllerRef.current = new AbortController()
      streamProcessorRef.current = new StreamProcessor()

      const response = await fetch('/api/optimize/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPrompt: state.originalPrompt,
          promptType: state.promptType,
          answers: state.answers
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.statusText}`)
      }

      setStatus('streaming')
      
      // 处理流式响应
      const fullContent = await streamProcessorRef.current.processStream(response, {
        onChunk: (chunk) => {
          setStreamedContent(prev => prev + chunk)
          // 更新进度（基于估计的总长度）
          setProgress(prev => Math.min(prev + 2, 95))
        },
        onComplete: () => {
          setProgress(100)
          setStatus('complete')
        },
        onError: (error) => {
          setStatus('error')
          onError?.(error)
        },
        signal: abortControllerRef.current.signal
      })

      onComplete(fullContent)
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setStatus('error')
        onError?.(error)
      }
    }
  }

  const retry = () => {
    setStreamedContent('')
    setProgress(0)
    startStreaming()
  }

  return (
    <div className="space-y-6">
      {/* 状态指示器 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {status === 'connecting' && (
            <>
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">连接中...</span>
            </>
          )}
          {status === 'streaming' && (
            <>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">正在生成优化结果...</span>
            </>
          )}
          {status === 'complete' && (
            <>
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-400">优化完成</span>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm text-red-400">连接错误</span>
            </>
          )}
        </div>
        
        {status === 'error' && (
          <button
            onClick={retry}
            className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            重试
          </button>
        )}
      </div>

      {/* 进度条 */}
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 内容显示区域 */}
      <div className="relative">
        <div className="glass-card rounded-xl p-6 min-h-[200px] max-h-[400px] overflow-y-auto">
          {streamedContent ? (
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                {streamedContent}
              </pre>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <span className="text-gray-400">准备接收数据...</span>
              </div>
            </div>
          )}
          
          {/* 流式光标效果 */}
          {status === 'streaming' && (
            <span className="inline-block w-2 h-5 bg-teal-500 animate-pulse ml-1" />
          )}
        </div>

        {/* 性能指标 */}
        {status === 'streaming' && (
          <div className="absolute top-2 right-2 text-xs text-gray-500">
            已接收: {(streamedContent.length / 1024).toFixed(1)} KB
          </div>
        )}
      </div>
    </div>
  )
}