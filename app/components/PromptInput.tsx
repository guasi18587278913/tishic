'use client'

import { useState } from 'react'

interface PromptInputProps {
  onSubmit: (prompt: string) => void
  disabled?: boolean
}

const examplePrompts = [
  { type: '创作类', text: '写一篇关于AI的文章' },
  { type: '分析类', text: '分析比较两种技术方案' },
  { type: '任务类', text: '帮我总结这份报告' },
  { type: '生成类', text: '生成一个登录页面的代码' },
]

export default function PromptInput({ onSubmit, disabled }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [enableStreaming, setEnableStreaming] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onSubmit(prompt.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter 提交
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (prompt.trim()) {
        onSubmit(prompt.trim())
      }
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-center">输入你的初始想法</h2>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例如：写一篇关于AI发展的文章..."
          className="w-full h-32 p-4 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-white placeholder-gray-500"
          disabled={disabled}
        />
        
        <button
          type="submit"
          disabled={disabled || !prompt.trim()}
          className="mt-4 w-full gradient-button-primary text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group neon-teal"
        >
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
          <span className="relative">开始优化</span>
        </button>
      </form>

      <div className="mt-6">
        <p className="text-sm text-gray-400 mb-3 text-center">或选择一个示例场景：</p>
        <div className="grid grid-cols-2 gap-2">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example.text)}
              disabled={disabled}
              className="text-left p-3 glass border border-gray-700 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300 text-sm disabled:cursor-not-allowed"
            >
              <span className="font-medium text-teal-400">{example.type}：</span>
              <span className="text-gray-300">{example.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}