'use client'

import { useState, useRef, useEffect } from 'react'
import { OptimizationDimensions } from '../types'

interface OptimizedResultProps {
  result: string
  originalPrompt: string
  dimensions?: OptimizationDimensions
}

export default function OptimizedResult({ result, originalPrompt, dimensions }: OptimizedResultProps) {
  const [copied, setCopied] = useState(false)
  const [isScrollable, setIsScrollable] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      const element = scrollRef.current
      setIsScrollable(element.scrollHeight > element.clientHeight)
    }
  }, [result])

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="animate-slide-up space-y-6">
      {/* Header with icon */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
          <i className="fas fa-sparkles text-white"></i>
        </div>
        <h3 className="text-2xl font-bold text-white">优化完成</h3>
      </div>
      
      {/* Original prompt - subtle background */}
      <div className="glass-card rounded-xl p-4 border border-gray-800/50">
        <div className="flex items-center gap-2 mb-2">
          <i className="fas fa-quote-left text-gray-500 text-xs"></i>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">原始提示词</h4>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">{originalPrompt}</p>
      </div>

      {/* Optimized result - prominent display */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
        <div className="relative glass-card rounded-2xl p-6 border border-teal-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
              <h4 className="text-sm font-medium text-teal-400">优化后的提示词</h4>
            </div>
            {/* Quick copy button */}
            <button
              onClick={handleCopy}
              className="text-gray-400 hover:text-teal-400 transition-colors p-2"
              title="复制"
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} text-sm`}></i>
            </button>
          </div>
          <div className="relative">
            <div ref={scrollRef} className="max-h-96 overflow-y-auto custom-scrollbar rounded-lg pr-2">
              <pre className="whitespace-pre-wrap text-gray-100 leading-relaxed font-sans text-[15px] p-2">{result}</pre>
            </div>
            {/* Scroll indicator */}
            {isScrollable && (
              <div className="absolute bottom-2 right-4 text-gray-500 text-xs flex items-center gap-1 animate-pulse">
                <i className="fas fa-mouse text-xs"></i>
                <span>滚动查看更多</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 gradient-button-primary text-white py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} text-sm group-hover:scale-110 transition-transform`}></i>
          <span>{copied ? '已复制' : '复制全部'}</span>
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="flex-1 glass border border-gray-700 text-gray-300 py-3 px-4 rounded-xl hover:bg-white hover:bg-opacity-5 hover:border-gray-600 transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <i className="fas fa-redo text-sm group-hover:rotate-180 transition-transform duration-500"></i>
          <span>再次优化</span>
        </button>
      </div>

      {/* Six dimensions breakdown */}
      {dimensions && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <i className="fas fa-cube text-teal-500"></i>
            <h4 className="text-lg font-semibold text-white">六维度优化分析</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: 'fa-ban', label: '反模式设定', value: dimensions.antiPatterns?.join('、') || '未指定' },
              { icon: 'fa-image', label: '场景氛围', value: dimensions.sceneAtmosphere || '未指定' },
              { icon: 'fa-palette', label: '风格深度', value: dimensions.styleDepth || '未指定' },
              { icon: 'fa-bullseye', label: '核心聚焦', value: dimensions.coreFocus || '未指定' },
              { icon: 'fa-ruler', label: '形式约束', value: dimensions.formalConstraints || '未指定' },
              { icon: 'fa-star', label: '质量标准', value: dimensions.qualityStandards || '未指定' }
            ].map((item, index) => (
              <div key={index} className="glass-card rounded-lg p-3 border border-gray-800/50 hover:border-teal-500/20 transition-colors">
                <div className="flex items-start gap-3">
                  <i className={`fas ${item.icon} text-teal-500 text-xs mt-1`}></i>
                  <div className="flex-1">
                    <h5 className="text-xs font-medium text-gray-400 mb-1">{item.label}</h5>
                    <p className="text-sm text-gray-300 leading-relaxed">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}