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
        <p className="text-gray-400">我们将通过CLARITY框架，帮您优化成更专业、更有效的版本</p>
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
              <span>建议添加使用场景或目的，让AI更好地理解您的需求</span>
            </div>
          )}
          {!inputAnalysis.hasSpecifics && inputAnalysis.length > 10 && (
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <span>💡</span>
              <span>建议添加具体要求，如格式、风格或字数限制</span>
            </div>
          )}
        </div>
      )}
      
      {/* 示例提示词 */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">快速示例：</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example.text)}
              className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 
                       text-gray-300 text-sm hover:bg-gray-800 hover:border-gray-600 
                       hover:text-white transition-all duration-200 flex items-center gap-2"
            >
              <span>{example.icon}</span>
              <span>{example.text}</span>
            </button>
          ))}
        </div>
      </div>
      
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
        {/* 优化评分卡片 */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-xl font-light text-white mb-4">优化分析</h3>
          
          {/* 评分指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: '清晰度', value: result.score.clarity, color: 'purple' },
              { label: '完整度', value: result.score.completeness, color: 'blue' },
              { label: '可执行性', value: result.score.executability, color: 'green' },
              { label: '预期效果', value: result.score.effectiveness, color: 'yellow' }
            ].map((metric, index) => (
              <div key={index} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - metric.value / 100)}`}
                      className={`text-${metric.color}-500 transition-all duration-1000`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-light text-white">{metric.value}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{metric.label}</p>
              </div>
            ))}
          </div>
          
          {/* 总分 */}
          <div className="text-center py-4 border-t border-gray-800">
            <p className="text-gray-400 mb-1">综合评分</p>
            <p className="text-3xl font-light text-white">{result.score.overall}/100</p>
          </div>
        </div>
        
        {/* 优化洞察 */}
        {result.insights.length > 0 && (
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <h3 className="text-xl font-light text-white mb-4">优化建议</h3>
            <div className="space-y-3">
              {result.insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    insight.priority === 'high' ? 'bg-red-500' :
                    insight.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-gray-300 mb-1">{insight.issue}</p>
                    <p className="text-sm text-gray-500">💡 {insight.suggestion}</p>
                    {insight.example && (
                      <p className="text-sm text-gray-600 mt-1 italic">{insight.example}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 优化版本选择 */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-xl font-light text-white mb-4">优化版本</h3>
          
          {/* 版本选择器 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {result.versions.map((version) => (
              <button
                key={version.id}
                onClick={() => setSelectedVersion(version)}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  selectedVersion?.id === version.id
                    ? 'bg-purple-900/30 border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'bg-gray-900/30 border-gray-700 hover:bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <h4 className="text-lg font-medium text-white mb-2">{version.title}</h4>
                <p className="text-sm text-gray-400 mb-3">{version.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">评分</span>
                  <span className="text-lg font-light text-purple-400">{version.score.overall}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* 选中版本详情 */}
          {selectedVersion && (
            <div
              key={selectedVersion.id}
              className="space-y-4 animate-fade-in"
            >
              {/* 优化亮点 */}
              <div>
                <h5 className="text-sm font-medium text-gray-400 mb-2">优化亮点</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedVersion.highlights.map((highlight, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-purple-900/30 border border-purple-700/50 
                               text-sm text-purple-300"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 优化理由 */}
              <div>
                <h5 className="text-sm font-medium text-gray-400 mb-2">优化理由</h5>
                <p className="text-gray-300">{selectedVersion.reasoning}</p>
              </div>
              
              {/* 优化后的提示词 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-400">优化后的提示词</h5>
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {showComparison ? '隐藏对比' : '显示对比'}
                  </button>
                </div>
                
                {showComparison && (
                  <div className="mb-4 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                    <p className="text-sm text-gray-500 mb-2">原始提示词：</p>
                    <p className="text-gray-300 whitespace-pre-wrap">{input}</p>
                  </div>
                )}
                
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 
                                text-gray-300 whitespace-pre-wrap overflow-x-auto">
                    {selectedVersion.prompt}
                  </pre>
                  <button
                    onClick={() => handleCopy(selectedVersion)}
                    className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-gray-800 
                             hover:bg-gray-700 text-gray-400 hover:text-white text-sm 
                             transition-all duration-200"
                  >
                    {copiedId === selectedVersion.id ? '已复制' : '复制'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 最佳实践 */}
        {result.bestPractices.length > 0 && (
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <h3 className="text-xl font-light text-white mb-4">最佳实践建议</h3>
            <div className="space-y-2">
              {result.bestPractices.map((practice, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-gray-300 animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="flex-shrink-0">{practice.startsWith('✅') ? '' : '•'}</span>
                  <span>{practice}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 相似优秀示例 */}
        {result.similarExamples && result.similarExamples.length > 0 && (
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <h3 className="text-xl font-light text-white mb-4">相似的优秀示例</h3>
            <div className="space-y-4">
              {result.similarExamples.map((example, index) => (
                <div
                  key={example.id}
                  className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:bg-gray-900/70 hover:border-gray-700 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-medium text-white">{example.title}</h4>
                    <span className="text-sm text-purple-400 font-light">评分 {example.score.overall}/100</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{example.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">原始提示词：</p>
                      <p className="text-sm text-gray-300">{example.original}</p>
                    </div>
                    
                    <details className="cursor-pointer">
                      <summary className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                        查看优化版本
                      </summary>
                      <div className="mt-2 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap">{example.optimized}</pre>
                      </div>
                    </details>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-gray-500">标签：</span>
                      <div className="flex flex-wrap gap-1">
                        {example.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-0.5 text-xs rounded-full bg-gray-800 border border-gray-700 text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
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
        <h1 className="text-4xl font-light text-white mb-3">
          CLARITY 智能提示词优化器
        </h1>
        <p className="text-xl text-gray-400">
          基于七维优化框架，让您的提示词更专业、更有效
        </p>
      </div>
      
      {/* CLARITY框架说明 */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-8">
        {[
          { letter: 'C', word: 'Contextualize', desc: '情境化' },
          { letter: 'L', word: 'Layer', desc: '层次化' },
          { letter: 'A', word: 'Amplify', desc: '增强化' },
          { letter: 'R', word: 'Refine', desc: '精炼化' },
          { letter: 'I', word: 'Iterate', desc: '迭代化' },
          { letter: 'T', word: 'Tailor', desc: '定制化' },
          { letter: 'Y', word: 'Yield', desc: '产出化' }
        ].map((item, index) => (
          <div
            key={index}
            className="text-center group animate-fade-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 
                          border border-purple-500/30 flex items-center justify-center 
                          group-hover:from-purple-600/30 group-hover:to-blue-600/30 transition-all duration-300">
              <span className="text-xl font-bold text-purple-400">{item.letter}</span>
            </div>
            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
      
      {/* 主要内容区域 */}
      {!result ? renderInputSection() : renderResults()}
    </div>
  )
}