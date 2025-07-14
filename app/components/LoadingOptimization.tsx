'use client'

import { useEffect, useState } from 'react'

const loadingTips = [
  '正在深度分析你的需求...',
  'Claude Opus 4 正在思考最佳方案...',
  '基于六维度框架构建优化策略...',
  '生成详细的优化建议...',
  '质量需要时间，请稍候...',
  '正在确保每个细节都完美...',
]

export default function LoadingOptimization() {
  const [currentTip, setCurrentTip] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % loadingTips.length)
    }, 3000)

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 15, 95))
    }, 1000)

    return () => {
      clearInterval(tipInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6 glass-effect animate-slide-up">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-4"></div>
            <p className="text-lg font-medium">正在优化中...</p>
          </div>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-gray-600 italic animate-pulse">
          💡 {loadingTips[currentTip]}
        </p>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>为什么需要等待？</strong><br />
            Claude Opus 4 是目前最强大的AI模型，它会深度思考并生成高质量的优化结果。
            优秀的提示词值得等待！
          </p>
        </div>
      </div>
    </div>
  )
}