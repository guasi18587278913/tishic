'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { promptPreloader } from '../lib/prompt-preloader'
import { debounce } from '../lib/api-utils'

interface PromptInputProps {
  onSubmit: (prompt: string) => void
  disabled?: boolean
}

const examplePrompts = [
  { id: 'writing', text: '帮我写一份产品发布的新闻稿', icon: '✍️' },
  { id: 'analysis', text: '分析这个市场趋势的优劣势', icon: '📊' },
  { id: 'creative', text: '设计一个创新的营销方案', icon: '💡' },
  { id: 'technical', text: '解释区块链的工作原理', icon: '🔧' },
]

export default function PromptInput({ onSubmit, disabled }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // 自动聚焦
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])
  
  // 创建防抖的预测函数
  const predictInput = useCallback(
    debounce((input: string) => {
      if (input.length > 5) {
        promptPreloader.predictUserInput(input)
      }
    }, 500),
    []
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onSubmit(prompt.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter 直接提交（移除 Ctrl/Cmd 要求）
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (prompt.trim()) {
        onSubmit(prompt.trim())
      }
    }
  }

  const handleExampleClick = (exampleText: string) => {
    setPrompt(exampleText)
    textareaRef.current?.focus()
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* 主标题区域 */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl font-extralight text-white mb-4">
          优化你的提示词
        </h1>
        <p className="text-lg font-light text-gray-400">
          我们将分析并改进你的提示词，让AI更准确理解你的意图
        </p>
      </div>

      {/* 主输入区域 */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative transition-all duration-500 ${isFocused ? 'scale-[1.02]' : ''}`}>
          {/* 输入框光晕效果 - 使用紫色调呼应入口按钮 */}
          <div className={`absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-2xl transition-opacity duration-700 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
          
          {/* 输入框容器 */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                const newValue = e.target.value
                setPrompt(newValue)
                predictInput(newValue)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="在此粘贴或输入你的提示词..."
              className="w-full min-h-[200px] p-8 rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/10 
                       focus:border-white/30 focus:bg-white/[0.05] focus:outline-none
                       text-white text-lg font-light placeholder-gray-500 resize-none
                       transition-all duration-300"
              disabled={disabled}
              style={{ fontFamily: 'SF Mono, Monaco, monospace' }}
            />
            
            {/* 字数统计 */}
            <div className="absolute bottom-4 right-4 text-sm text-gray-500">
              {prompt.length} 字符
            </div>
          </div>
        </div>


        {/* 提交按钮 */}
        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            disabled={disabled || !prompt.trim()}
            className="group relative px-12 py-4 rounded-2xl font-light text-lg
                     bg-gradient-to-r from-purple-600 to-blue-600 text-white
                     hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-0.5
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
                     transition-all duration-300"
          >
            {/* 按钮光晕 */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* 按钮内容 */}
            <span className="relative flex items-center gap-3">
              <span>开始优化</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>

        {/* 提示文字 */}
        <p className="mt-4 text-center text-sm font-light text-gray-500">
          优化过程约需30秒
        </p>
      </form>

      {/* 底部流程说明 */}
      <div className="mt-16 flex justify-center items-center gap-8 opacity-50 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        {[
          { icon: '1', label: '智能分析' },
          { icon: '2', label: '深度优化' },
          { icon: '3', label: '效果提升' }
        ].map((step, index) => (
          <div key={index} className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-purple-600/30 flex items-center justify-center text-sm font-light text-gray-400">
                {step.icon}
              </div>
              <span className="text-xs font-light text-gray-500">{step.label}</span>
            </div>
            {index < 2 && (
              <div className="w-16 h-px bg-gradient-to-r from-purple-600/20 to-transparent" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}