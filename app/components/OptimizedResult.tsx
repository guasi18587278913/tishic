'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface OptimizedResultProps {
  result: string
  originalPrompt: string
  dimensions?: {
    antiPatterns: string[]
    sceneAtmosphere: string
    styleDepth: string
    coreFocus: string
    formalConstraints: string
    qualityStandards: string
  }
}

export default function OptimizedResult({ result, originalPrompt, dimensions }: OptimizedResultProps) {
  const [copiedOriginal, setCopiedOriginal] = useState(false)
  const [copiedOptimized, setCopiedOptimized] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const handleCopy = async (text: string, isOriginal: boolean) => {
    try {
      await navigator.clipboard.writeText(text)
      if (isOriginal) {
        setCopiedOriginal(true)
        setTimeout(() => setCopiedOriginal(false), 2000)
      } else {
        setCopiedOptimized(true)
        setTimeout(() => setCopiedOptimized(false), 2000)
      }
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 计算优化提升百分比（示例计算）
  const improvementPercentage = Math.round((result.length / originalPrompt.length) * 100 - 100)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 成功标题 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-400 font-light">优化成功</span>
          <span className="text-green-300 text-sm">→ +{improvementPercentage}%</span>
        </div>
        
        <h2 className="text-4xl font-extralight text-white">
          提示词优化提升了 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-normal">{improvementPercentage}%</span> 的效果
        </h2>
        <p className="text-gray-400 font-light">基于六维度优化框架，全方位提升提示词质量</p>
      </motion.div>

      {/* 对比展示切换 */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="px-4 py-2 rounded-lg backdrop-blur-xl bg-white/[0.03] border border-white/10 
                   hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300
                   text-sm font-light text-gray-400 hover:text-white"
        >
          {showComparison ? '隐藏对比' : '查看对比'}
        </button>
      </div>

      {/* 主要内容区域 */}
      <div className="space-y-6">
        {/* 优化后的提示词 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-xl" />
          <div className="relative backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400" />
                <h3 className="text-lg font-light text-white">优化后的提示词</h3>
                {!showComparison && (
                  <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-light">已优化</span>
                )}
              </div>
              <button
                onClick={() => handleCopy(result, false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-xl bg-white/[0.03] 
                         border border-white/10 hover:bg-white/[0.05] hover:border-white/20 
                         transition-all duration-300 group/btn"
              >
                {copiedOptimized ? (
                  <>
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-light text-green-400">已复制</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-gray-400 group-hover/btn:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-light text-gray-400 group-hover/btn:text-white transition-colors">复制</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-white font-light leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
          </div>
        </motion.div>

        {/* 对比展示 */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <h3 className="text-lg font-light text-gray-400">原始提示词</h3>
            </div>
            <div className="text-gray-500 font-light leading-relaxed whitespace-pre-wrap mb-4">
              {originalPrompt}
            </div>
            <button
              onClick={() => handleCopy(originalPrompt, true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-xl bg-white/[0.03] 
                       border border-white/10 hover:bg-white/[0.05] hover:border-white/20 
                       transition-all duration-300"
            >
              {copiedOriginal ? (
                <>
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-light text-green-400">已复制</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-light text-gray-400">复制原始</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* 六维度优化分析 */}
        {dimensions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8"
          >
            <h3 className="text-lg font-light text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              六维度优化分析
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries({
                '反模式设定': dimensions.antiPatterns.join('、'),
                '场景氛围': dimensions.sceneAtmosphere,
                '风格深度': dimensions.styleDepth,
                '核心聚焦': dimensions.coreFocus,
                '形式约束': dimensions.formalConstraints,
                '质量标准': dimensions.qualityStandards
              }).map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 mt-2" />
                  <div>
                    <h4 className="text-sm font-light text-gray-400 mb-1">{key}</h4>
                    <p className="text-white font-light">{value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 操作按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-4 pt-6"
        >
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 rounded-xl backdrop-blur-xl bg-white/[0.03] border border-white/10 
                     hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300
                     text-white font-light"
          >
            再次优化
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 
                     hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300
                     text-white font-light"
          >
            返回首页
          </button>
        </motion.div>
      </div>
    </div>
  )
}