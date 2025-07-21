'use client'

import { useState } from 'react'
import { SmartSuggestions } from '../types/index'

interface SmartSuggestionsCardProps {
  suggestions: SmartSuggestions
  onConfirm: (updatedSuggestions: SmartSuggestions) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function SmartSuggestionsCard({ 
  suggestions, 
  onConfirm, 
  onCancel,
  isLoading = false
}: SmartSuggestionsCardProps) {
  const [editedSuggestions, setEditedSuggestions] = useState<SmartSuggestions>(suggestions)
  const [isEditing, setIsEditing] = useState(false)

  const handleFieldEdit = (field: keyof SmartSuggestions, value: any) => {
    setEditedSuggestions(prev => ({
      ...prev,
      [field]: value
    }))
    setIsEditing(true)
  }

  const handleConfirm = () => {
    onConfirm(editedSuggestions)
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="backdrop-blur-xl bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 
                            flex items-center justify-center animate-pulse">
                <span className="text-2xl">✨</span>
              </div>
              <p className="text-gray-300">AI 正在分析你的需求...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="backdrop-blur-xl bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="text-xl">✨</span>
            AI 为你推荐的优化方向
          </h3>
          {isEditing && (
            <span className="text-xs text-purple-400">已修改</span>
          )}
        </div>

        <div className="space-y-4">
          {/* 避免什么 */}
          <div className="group">
            <label className="text-sm text-gray-400 mb-1 block">避免：</label>
            <div className="flex flex-wrap gap-2">
              {editedSuggestions.avoidances.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 
                           text-red-400 text-sm cursor-pointer hover:bg-red-500/20 transition-colors"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newAvoidances = [...editedSuggestions.avoidances]
                    newAvoidances[index] = e.currentTarget.textContent || ''
                    handleFieldEdit('avoidances', newAvoidances)
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* 风格 */}
          <div className="group">
            <label className="text-sm text-gray-400 mb-1 block">风格：</label>
            <div 
              className="px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 
                       text-gray-200 text-sm cursor-pointer hover:bg-gray-700/70 transition-colors"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleFieldEdit('style', e.currentTarget.textContent || '')}
            >
              {editedSuggestions.style}
            </div>
          </div>

          {/* 重点 */}
          <div className="group">
            <label className="text-sm text-gray-400 mb-1 block">聚焦重点：</label>
            <div 
              className="px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 
                       text-gray-200 text-sm cursor-pointer hover:bg-gray-700/70 transition-colors"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleFieldEdit('focus', e.currentTarget.textContent || '')}
            >
              {editedSuggestions.focus}
            </div>
          </div>

          {/* 场景（如果有） */}
          {editedSuggestions.context && (
            <div className="group">
              <label className="text-sm text-gray-400 mb-1 block">场景：</label>
              <div 
                className="px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 
                         text-gray-200 text-sm cursor-pointer hover:bg-gray-700/70 transition-colors"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleFieldEdit('context', e.currentTarget.textContent || '')}
              >
                {editedSuggestions.context}
              </div>
            </div>
          )}
        </div>

        {/* 提示 */}
        <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          点击任何内容即可编辑
        </div>

        {/* 操作按钮 */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/90 to-blue-600/90 
                     text-white font-medium hover:from-purple-600 hover:to-blue-600 
                     transition-all duration-300"
          >
            看起来不错，开始优化
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 
                     text-gray-300 font-medium hover:bg-gray-800/70 hover:border-gray-600
                     transition-all duration-300"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  )
}