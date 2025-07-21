'use client'

import { useState, useEffect } from 'react'
import { OptimizationResult } from '../types/index'

interface OptimizationPreviewProps {
  isOptimizing: boolean
  result: OptimizationResult | null
  onCopy: () => void
  copied: boolean
}

export default function OptimizationPreview({ 
  isOptimizing, 
  result, 
  onCopy, 
  copied 
}: OptimizationPreviewProps) {
  const [displayText, setDisplayText] = useState('')
  
  // Typing animation effect
  useEffect(() => {
    if (result?.optimized && !isOptimizing) {
      const text = result.optimized
      let currentIndex = 0
      setDisplayText('')
      
      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(prev => prev + text[currentIndex])
          currentIndex++
        } else {
          clearInterval(interval)
        }
      }, 10) // Fast typing speed
      
      return () => clearInterval(interval)
    }
  }, [result, isOptimizing])
  
  // Loading state
  if (isOptimizing) {
    return (
      <div className="animate-fade-in">
        <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 
                      border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" style={{ animationDelay: '0.5s' }} />
              
              {/* Center icon */}
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 
                            flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-light text-white mb-2">AI 正在优化你的提示词</h3>
            <p className="text-sm text-gray-400">深度分析语义，智能重构结构...</p>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  // Result state
  if (result) {
    return (
      <div className="animate-fade-in">
        <div className="backdrop-blur-xl bg-gray-800/50 
                      border border-gray-700 rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400" />
              <h3 className="text-lg font-normal text-white">优化结果</h3>
              {result.analysis && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs">
                  {getTaskTypeLabel(result.taskType)}
                </span>
              )}
            </div>
            
            <button
              onClick={onCopy}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/10 
                       hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300
                       group"
              title="复制优化结果"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" 
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Optimized content */}
          <div className="relative">
            <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
              <div className="text-gray-100 font-normal leading-relaxed whitespace-pre-wrap">
                {displayText}
                {displayText.length < (result.optimized?.length || 0) && (
                  <span className="inline-block w-0.5 h-5 bg-purple-400 animate-pulse ml-0.5" />
                )}
              </div>
            </div>
            
            {/* Gradient overlay for long content */}
            {(result.optimized?.length || 0) > 500 && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t 
                            from-gray-950/80 to-transparent rounded-b-xl pointer-events-none" />
            )}
          </div>
          
          {/* Analysis info */}
          {result.analysis && (
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                优化提升: {Math.round(((result.optimized?.length || 0) / result.original.length - 1) * 100)}%
              </div>
              {result.analysis.confidence && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  置信度: {Math.round(result.analysis.confidence * 100)}%
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  return null
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