'use client'

import { useState, useEffect, useRef } from 'react'
import { OptimizationState } from '../types'
import SegmentedPromptDisplay from './SegmentedPromptDisplay'

interface StreamingOptimizationProcessProps {
  state: OptimizationState
  onComplete: (result: string) => void
}

export default function StreamingOptimizationProcess({ 
  state, 
  onComplete 
}: StreamingOptimizationProcessProps) {
  const [streamedContent, setStreamedContent] = useState('')
  const [displayContent, setDisplayContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const displayIndexRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (state.stage === 'optimizing' && !isStreaming) {
      startStreaming()
    }
  }, [state.stage])

  // Smooth text animation
  useEffect(() => {
    const animateText = () => {
      if (displayIndexRef.current < streamedContent.length) {
        const charsToAdd = Math.min(3, streamedContent.length - displayIndexRef.current)
        setDisplayContent(streamedContent.substring(0, displayIndexRef.current + charsToAdd))
        displayIndexRef.current += charsToAdd
        animationFrameRef.current = requestAnimationFrame(animateText)
      }
    }

    if (streamedContent.length > displayContent.length) {
      animationFrameRef.current = requestAnimationFrame(animateText)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [streamedContent, displayContent])

  const startStreaming = async () => {
    setIsStreaming(true)
    let fullContent = ''
    const abortController = new AbortController()
    let retryCount = 0
    const maxRetries = 3

    const attemptStream = async (): Promise<void> => {
      try {
        setConnectionStatus('connecting')
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
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        setConnectionStatus('connected')

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) throw new Error('No reader available')

        let buffer = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') {
                // Ensure all content is displayed before completing
                setStreamedContent(fullContent)
                setDisplayContent(fullContent)
                displayIndexRef.current = fullContent.length
                console.log('Stream completed, fullContent length:', fullContent.length)
                console.log('First 200 chars:', fullContent.substring(0, 200))
                setTimeout(() => {
                  console.log('Calling onComplete with content')
                  onComplete(fullContent)
                }, 500)
                return
              }

              if (data) {
                try {
                  const parsed = JSON.parse(data)
                  // Handle OpenAI format (from Gemini conversion)
                  if (parsed.choices && parsed.choices[0]?.delta?.content) {
                    const content = parsed.choices[0].delta.content
                    fullContent += content
                    setStreamedContent(fullContent)
                  } else if (parsed.content) {
                    fullContent += parsed.content
                    setStreamedContent(fullContent)
                  } else if (parsed.error) {
                    throw new Error(parsed.error)
                  } else if (parsed.warning) {
                    console.warn('Stream warning:', parsed.warning)
                  }
                } catch (e) {
                  if (e instanceof SyntaxError) {
                    console.error('JSON parse error:', e, 'Data:', data)
                  } else {
                    throw e
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Streaming error:', error)
        
        // 如果是网络错误且还有重试次数，进行重试
        if (retryCount < maxRetries && !abortController.signal.aborted) {
          retryCount++
          console.log(`Retrying stream... (${retryCount}/${maxRetries})`)
          
          // 指数退避
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
          
          // 重试
          return attemptStream()
        }
        
        // 最终失败，显示错误
        setConnectionStatus('error')
        setStreamedContent('优化过程中出现错误，请重试。错误信息：' + (error instanceof Error ? error.message : 'Unknown error'))
        setDisplayContent('优化过程中出现错误，请重试。错误信息：' + (error instanceof Error ? error.message : 'Unknown error'))
      } finally {
        setIsStreaming(false)
      }
    }

    await attemptStream()
  }

  if (state.stage !== 'optimizing') return null

  return (
    <div className="glass-card rounded-2xl p-6 animate-slide-up">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center animate-pulse">
              <i className="fas fa-magic text-white"></i>
            </div>
            <h3 className="text-xl font-semibold text-white">正在优化中</h3>
          </div>
          <div className="flex items-center text-sm">
            {connectionStatus === 'connecting' && (
              <>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-yellow-400">正在连接...</span>
              </>
            )}
            {connectionStatus === 'connected' && isStreaming && (
              <>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse mr-2"></div>
                <span className="text-teal-400">实时生成中</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                <span className="text-red-400">连接异常</span>
              </>
            )}
          </div>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
            style={{ 
              width: displayContent.length > 0 ? '100%' : '0%',
              animation: isStreaming ? 'pulse 2s infinite' : 'none'
            }}
          />
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-xl p-6 max-h-[600px] overflow-y-auto border border-gray-800">
        {displayContent ? (
          <SegmentedPromptDisplay 
            content={displayContent}
            isStreaming={isStreaming}
            onRetrySegment={(segmentTitle) => {
              console.log('Retry segment:', segmentTitle)
              // TODO: 实现重试特定段落的功能
            }}
          />
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
              <i className="fas fa-spinner fa-spin text-2xl text-teal-400"></i>
            </div>
            <p className="text-gray-500">等待响应开始...</p>
          </div>
        )}
      </div>

      <div className="mt-4 p-4 glass rounded-lg border border-teal-500/20">
        <div className="flex items-start gap-2">
          <i className="fas fa-info-circle text-teal-400 text-sm mt-0.5"></i>
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong>流式响应已启用</strong> - Gemini 2.5 Pro 正在快速生成并实时显示结果
          </p>
        </div>
      </div>
    </div>
  )
}