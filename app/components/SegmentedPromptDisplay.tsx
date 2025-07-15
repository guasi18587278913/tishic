'use client'

import { useState, useEffect } from 'react'
import { PromptSegment, PromptSegmenter } from '../lib/prompt-segmenter'

interface SegmentedPromptDisplayProps {
  content: string
  isStreaming?: boolean
  onRetrySegment?: (segmentTitle: string) => void
}

export default function SegmentedPromptDisplay({ 
  content, 
  isStreaming = false,
  onRetrySegment 
}: SegmentedPromptDisplayProps) {
  const [segments, setSegments] = useState<PromptSegment[]>([])
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set())
  const [copiedSegmentId, setCopiedSegmentId] = useState<string | null>(null)

  // 解析内容为分段
  useEffect(() => {
    if (content) {
      const parsed = PromptSegmenter.parseSegments(content)
      setSegments(parsed)
      
      // 默认展开所有段落
      const allIds = new Set(parsed.map(s => s.id))
      setExpandedSegments(allIds)
    }
  }, [content])

  // 切换段落展开/折叠
  const toggleSegment = (segmentId: string) => {
    setExpandedSegments(prev => {
      const next = new Set(prev)
      if (next.has(segmentId)) {
        next.delete(segmentId)
      } else {
        next.add(segmentId)
      }
      return next
    })
  }

  // 复制段落内容
  const copySegment = async (segment: PromptSegment) => {
    try {
      await navigator.clipboard.writeText(segment.content)
      setCopiedSegmentId(segment.id)
      setTimeout(() => setCopiedSegmentId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // 复制所有内容
  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedSegmentId('all')
      setTimeout(() => setCopiedSegmentId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (segments.length === 0) {
    return <div className="text-gray-400">正在生成...</div>
  }

  return (
    <div className="space-y-4">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
        <div className="text-sm text-gray-400">
          共 {segments.length} 个段落
          {segments.some(s => !s.isComplete) && (
            <span className="ml-2 text-yellow-400">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              部分内容可能被截断
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const allExpanded = segments.every(s => expandedSegments.has(s.id))
              if (allExpanded) {
                setExpandedSegments(new Set())
              } else {
                setExpandedSegments(new Set(segments.map(s => s.id)))
              }
            }}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <i className={`fas fa-${expandedSegments.size === segments.length ? 'compress' : 'expand'} mr-1`}></i>
            {expandedSegments.size === segments.length ? '折叠全部' : '展开全部'}
          </button>
          <button
            onClick={copyAll}
            className="px-3 py-1 text-sm bg-teal-600 hover:bg-teal-500 rounded transition-colors"
          >
            <i className="fas fa-copy mr-1"></i>
            {copiedSegmentId === 'all' ? '已复制' : '复制全部'}
          </button>
        </div>
      </div>

      {/* 分段显示 */}
      <div className="space-y-3">
        {segments.map((segment) => (
          <div 
            key={segment.id}
            className={`border rounded-lg overflow-hidden transition-all duration-300 ${
              segment.isComplete ? 'border-gray-700' : 'border-yellow-600/50'
            }`}
          >
            {/* 段落标题 */}
            <div 
              className="flex items-center justify-between p-4 bg-gray-800/50 cursor-pointer hover:bg-gray-800/70 transition-colors"
              onClick={() => toggleSegment(segment.id)}
            >
              <div className="flex items-center gap-3">
                <i className={`fas fa-chevron-${expandedSegments.has(segment.id) ? 'down' : 'right'} text-gray-400`}></i>
                <h3 className="font-medium text-lg">{segment.title}</h3>
                {!segment.isComplete && (
                  <span className="px-2 py-0.5 text-xs bg-yellow-600/20 text-yellow-400 rounded">
                    可能不完整
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!segment.isComplete && onRetrySegment && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRetrySegment(segment.title)
                    }}
                    className="px-3 py-1 text-sm bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded transition-colors"
                  >
                    <i className="fas fa-redo mr-1"></i>
                    重试
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copySegment(segment)
                  }}
                  className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  <i className="fas fa-copy mr-1"></i>
                  {copiedSegmentId === segment.id ? '已复制' : '复制'}
                </button>
              </div>
            </div>

            {/* 段落内容 */}
            {expandedSegments.has(segment.id) && (
              <div className="p-4 border-t border-gray-700">
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {segment.content}
                  </pre>
                </div>
                {!segment.isComplete && (
                  <div className="mt-4 p-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
                    <p className="text-sm text-yellow-400">
                      <i className="fas fa-info-circle mr-2"></i>
                      此段落可能被截断。您可以点击"重试"按钮继续生成剩余内容。
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 流式生成指示器 */}
      {isStreaming && (
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-teal-400">
            <div className="animate-pulse">
              <i className="fas fa-circle text-xs"></i>
            </div>
            <span className="text-sm">正在生成...</span>
          </div>
        </div>
      )}
    </div>
  )
}