'use client'

import { useState, useCallback, useEffect } from 'react'
import { 
  ClarityOptimizationResult, 
  OptimizedVersion, 
  OptimizationInsight,
  clarityOptimizer 
} from '../lib/clarity-optimizer'

interface ClarityOptimizerProps {
  onOptimizationComplete?: (result: ClarityOptimizationResult) => void
}

export default function ClarityOptimizer({ onOptimizationComplete }: ClarityOptimizerProps) {
  const [input, setInput] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [result, setResult] = useState<ClarityOptimizationResult | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<OptimizedVersion | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showPrinciples, setShowPrinciples] = useState(false)
  
  // 示例提示词
  const examples = [
    { text: '帮我写一篇关于人工智能的文章', icon: '✍️' },
    { text: '分析这份销售数据并给出建议', icon: '📊' },
    { text: '设计一个用户登录系统的架构', icon: '🏗️' },
    { text: '将这段中文翻译成英文', icon: '🌐' }
  ]
  
  // 实时输入分析
  const [inputAnalysis, setInputAnalysis] = useState({
    length: 0,
    hasContext: false,
    hasSpecifics: false,
    clarity: 0
  })
  
  useEffect(() => {
    if (input.trim()) {
      const analysis = {
        length: input.length,
        hasContext: input.includes('用于') || input.includes('目的') || input.includes('场景'),
        hasSpecifics: input.includes('要求') || input.includes('格式') || input.includes('字数'),
        clarity: calculateInputClarity(input)
      }
      setInputAnalysis(analysis)
    }
  }, [input])
  
  const calculateInputClarity = (text: string): number => {
    let score = 50 // 基础分
    if (text.length > 20) score += 10
    if (text.length > 50) score += 10
    if (text.includes('要求') || text.includes('需要')) score += 10
    if (text.includes('格式') || text.includes('风格')) score += 10
    if (text.includes('例如') || text.includes('比如')) score += 10
    return Math.min(100, score)
  }
  
  const handleOptimize = async () => {
    if (!input.trim() || isOptimizing) return
    
    setIsOptimizing(true)
    setResult(null)
    setSelectedVersion(null)
    
    try {
      // 调用CLARITY优化器
      const optimizationResult = await clarityOptimizer.optimize(input)
      setResult(optimizationResult)
      
      // 默认选中第一个版本
      if (optimizationResult.versions.length > 0) {
        setSelectedVersion(optimizationResult.versions[0])
      }
      
      if (onOptimizationComplete) {
        onOptimizationComplete(optimizationResult)
      }
    } catch (error) {
      console.error('Optimization error:', error)
    } finally {
      setIsOptimizing(false)
    }
  }
  
  const handleCopy = async (version: OptimizedVersion) => {
    await navigator.clipboard.writeText(version.prompt)
    setCopiedId(version.id)
    setTimeout(() => setCopiedId(null), 2000)
  }
  
  const handleExampleClick = (example: string) => {
    setInput(example)
  }
  
  const renderInputSection = () => (
    <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
      {/* 标题和说明 */}
      <div className="mb-6">
        <h2 className="text-2xl font-light text-white mb-2">输入您的提示词</h2>
        <p className="text-gray-400">我们将基于AI深度分析，帮您生成更精准、更易用的版本</p>
      </div>
      
      {/* 输入框 */}
      <div className="relative mb-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="描述您想要AI完成的任务..."
          className="w-full h-40 px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 
                   text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-gray-900/70
                   focus:border-purple-500/50 transition-all duration-300 resize-none"
          disabled={isOptimizing}
        />
        
        {/* 实时分析指示器 */}
        {input && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                inputAnalysis.clarity > 70 ? 'bg-green-500' : 
                inputAnalysis.clarity > 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-gray-400">清晰度 {inputAnalysis.clarity}%</span>
            </div>
          </div>
        )}
      </div>
      
      {/* 实时建议 */}
      {input && (
        <div className="mb-6 space-y-2">
          {!inputAnalysis.hasContext && (
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <span>💡</span>
              <span>添加使用场景，让结果更精准</span>
            </div>
          )}
          {!inputAnalysis.hasSpecifics && inputAnalysis.length > 10 && (
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <span>💡</span>
              <span>明确要求（如格式、风格），效果更佳</span>
            </div>
          )}
        </div>
      )}
      
      
      {/* 优化按钮 */}
      <button
        onClick={handleOptimize}
        disabled={!input.trim() || isOptimizing}
        className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600/90 to-blue-600/90 
                 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed
                 hover:from-purple-600 hover:to-blue-600 transition-all duration-300
                 hover:shadow-lg hover:shadow-purple-500/25 relative overflow-hidden group"
      >
        {isOptimizing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            正在通过CLARITY框架优化...
          </span>
        ) : (
          <>
            <span className="relative z-10">开始智能优化</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        )}
      </button>
    </div>
  )
  
  const renderResults = () => {
    if (!result) return null
    
    return (
      <div className="space-y-6 animate-fade-in">
        {/* 优化结果对比 - 核心展示 */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-white">优化完成！</h2>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>提升了 {Math.round((result.score.overall / 50 - 1) * 100)}%</span>
            </div>
          </div>
          
          {/* 原始 vs 优化对比 */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">原始提示词</h3>
              <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                <p className="text-gray-300 whitespace-pre-wrap">{input}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">优化后（推荐版本）</h3>
              <div className="relative p-4 rounded-lg bg-purple-900/20 border border-purple-500/50">
                <p className="text-gray-100 whitespace-pre-wrap">
                  {result.versions[0]?.prompt || '正在生成...'}
                </p>
                <button
                  onClick={() => handleCopy(result.versions[0])}
                  className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-purple-800/50 
                           hover:bg-purple-700/50 text-white text-sm transition-all duration-200"
                >
                  {copiedId === result.versions[0]?.id ? '已复制' : '复制'}
                </button>
              </div>
            </div>
          </div>
          
          {/* 关键改进点 */}
          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">主要改进</h3>
            <div className="flex flex-wrap gap-2">
              {result.versions[0]?.highlights.slice(0, 3).map((highlight, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-green-900/30 border border-green-700/50 
                           text-sm text-green-300"
                >
                  ✓ {highlight}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* 更多版本选择 - 简化展示 */}
        {result.versions.length > 1 && (
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <h3 className="text-lg font-light text-white mb-4">其他优化版本</h3>
            <div className="space-y-4">
              {result.versions.slice(1).map((version) => (
                <div key={version.id} className="border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-white">{version.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{version.description}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(version)}
                      className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 
                               text-gray-400 hover:text-white text-sm transition-all duration-200"
                    >
                      {copiedId === version.id ? '已复制' : '复制'}
                    </button>
                  </div>
                  <details className="mt-3">
                    <summary className="text-sm text-purple-400 hover:text-purple-300 cursor-pointer">
                      查看完整内容
                    </summary>
                    <div className="mt-2 p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap">{version.prompt}</pre>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 详细分析 - 折叠展示 */}
        <details className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl">
          <summary className="p-6 cursor-pointer hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-light text-white">查看详细分析</h3>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </summary>
          <div className="px-6 pb-6 space-y-6">
            {/* 评分概览 */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">评分概览</h4>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-light text-white">{result.score.overall}</p>
                  <p className="text-xs text-gray-500">综合评分</p>
                </div>
                <div className="flex-1 grid grid-cols-4 gap-2">
                  {[
                    { label: '清晰度', value: result.score.clarity },
                    { label: '完整度', value: result.score.completeness },
                    { label: '可执行性', value: result.score.executability },
                    { label: '预期效果', value: result.score.effectiveness }
                  ].map((metric, index) => (
                    <div key={index} className="text-center">
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-1">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 优化建议 */}
            {result.insights.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">优化要点</h4>
                <div className="space-y-2">
                  {result.insights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <p className="text-gray-300">{insight.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* CLARITY框架说明 */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">优化原理</h4>
              <p className="text-sm text-gray-500 mb-3">基于CLARITY七维框架进行全面分析</p>
              <div className="grid grid-cols-7 gap-2">
                {[
                  { letter: 'C', desc: '情境化' },
                  { letter: 'L', desc: '层次化' },
                  { letter: 'A', desc: '增强化' },
                  { letter: 'R', desc: '精炼化' },
                  { letter: 'I', desc: '迭代化' },
                  { letter: 'T', desc: '定制化' },
                  { letter: 'Y', desc: '产出化' }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-8 h-8 mx-auto mb-1 rounded bg-purple-900/30 border border-purple-700/50 
                                  flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-400">{item.letter}</span>
                    </div>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>
        
        {/* 重新开始按钮 */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => {
              setInput('')
              setResult(null)
              setSelectedVersion(null)
            }}
            className="px-6 py-3 rounded-xl bg-gray-800/50 border border-gray-700 
                     text-gray-300 hover:bg-gray-800 hover:border-gray-600 
                     hover:text-white transition-all duration-200"
          >
            优化新的提示词
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 标题部分 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-light text-white">
          智能提示词优化器
        </h1>
      </div>
      
      
      {/* 主要内容区域 */}
      {!result ? renderInputSection() : renderResults()}
    </div>
  )
}