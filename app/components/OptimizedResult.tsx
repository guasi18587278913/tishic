'use client'

import { useState } from 'react'
import { OptimizationDimensions } from '../types'

interface OptimizedResultProps {
  result: string
  originalPrompt: string
  dimensions?: OptimizationDimensions
}

export default function OptimizedResult({ result, originalPrompt, dimensions }: OptimizedResultProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="animate-slide-up">
      <h3 className="text-2xl font-bold mb-6 text-gradient">优化结果</h3>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-2">原始提示词：</h4>
        <p className="text-gray-300 italic">{originalPrompt}</p>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2">优化后的提示词：</h4>
        <div className="bg-gray-900 rounded-lg p-4 relative border border-gray-800">
          <pre className="whitespace-pre-wrap text-sm text-gray-100 font-mono">
            {result}
          </pre>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center"
        >
          {copied ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              已复制
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              复制提示词
            </>
          )}
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full glass border border-gray-700 text-white py-2 px-4 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          优化新的提示词
        </button>
      </div>

      {dimensions && (
        <div className="mt-6 space-y-3">
          <h4 className="text-lg font-semibold text-white mb-4">六维度优化详情</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <span className="text-purple-400 mr-2">1.</span>
              <span className="text-gray-700">反模式设定：{dimensions.antiPatterns?.join('、') || '未指定'}</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-400 mr-2">2.</span>
              <span className="text-gray-700">场景氛围：{dimensions.sceneAtmosphere || '未指定'}</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-400 mr-2">3.</span>
              <span className="text-gray-700">风格深度：{dimensions.styleDepth || '未指定'}</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-400 mr-2">4.</span>
              <span className="text-gray-700">核心聚焦：{dimensions.coreFocus || '未指定'}</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-400 mr-2">5.</span>
              <span className="text-gray-700">形式约束：{dimensions.formalConstraints || '未指定'}</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-400 mr-2">6.</span>
              <span className="text-gray-700">质量标准：{dimensions.qualityStandards || '未指定'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}