'use client'

import { useState } from 'react'
import { OptimizationResult } from '../types/index'

interface OptimizationHistoryProps {
  history: OptimizationResult[]
  onUseTemplate?: (prompt: string) => void
}

export default function OptimizationHistory({ history, onUseTemplate }: OptimizationHistoryProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (history.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-light text-white mb-4">优化历史</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 
                        flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">暂无优化记录</p>
          <p className="text-gray-600 text-xs mt-1">开始优化后，历史记录将显示在这里</p>
        </div>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-light text-white">优化历史</h3>
        <span className="text-xs text-gray-500">最近 {history.length} 条</span>
      </div>
      
      <div className="space-y-3">
        {history.map((item, index) => {
          const isExpanded = expandedIndex === index
          const isCopied = copiedIndex === index
          
          return (
            <div
              key={index}
              className="group relative p-4 rounded-xl bg-white/[0.02] border border-white/5 
                       hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString('zh-CN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs">
                      {getTaskTypeLabel(item.taskType)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-1">
                    {item.original}
                  </p>
                </div>
                
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
                >
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {/* Expanded content */}
              {isExpanded && (
                <div className="mt-4 space-y-3 animate-expand">
                  <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                    <p className="text-xs text-gray-400 mb-1">优化结果:</p>
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
                      {item.optimized}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(item.optimized, index)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 
                               hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300
                               text-xs text-gray-300 flex items-center justify-center gap-1"
                    >
                      {isCopied ? (
                        <>
                          <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          已复制
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          复制
                        </>
                      )}
                    </button>
                    
                    {onUseTemplate && (
                      <button
                        onClick={() => onUseTemplate(item.optimized)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 
                                 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all duration-300
                                 text-xs text-purple-400 flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M12 4v16m8-8H4" />
                        </svg>
                        创建模板
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getTaskTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    tool: '工具类',
    creative: '创作类',
    analytical: '分析类',
    generative: '生成类',
    general: '通用类'
  }
  return labels[type] || '通用类'
}