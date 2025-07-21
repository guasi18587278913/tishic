'use client'

import { useState } from 'react'
import { DeepCustomizationOptions } from '../lib/prompt-optimizer-v4'

interface DeepCustomizationCardProps {
  onConfirm: (options: DeepCustomizationOptions) => void
  onCancel: () => void
}

export default function DeepCustomizationCard({ 
  onConfirm, 
  onCancel 
}: DeepCustomizationCardProps) {
  const [options, setOptions] = useState<DeepCustomizationOptions>({
    role: '',
    examples: [''],
    format: '',
    tone: '',
    additionalContext: '',
    specialRequirements: ['']
  })

  const updateOption = (key: keyof DeepCustomizationOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const addExample = () => {
    setOptions(prev => ({
      ...prev,
      examples: [...(prev.examples || []), '']
    }))
  }

  const updateExample = (index: number, value: string) => {
    const newExamples = [...(options.examples || [])]
    newExamples[index] = value
    setOptions(prev => ({ ...prev, examples: newExamples }))
  }

  const removeExample = (index: number) => {
    const newExamples = (options.examples || []).filter((_, i) => i !== index)
    setOptions(prev => ({ ...prev, examples: newExamples }))
  }

  const addRequirement = () => {
    setOptions(prev => ({
      ...prev,
      specialRequirements: [...(prev.specialRequirements || []), '']
    }))
  }

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...(options.specialRequirements || [])]
    newRequirements[index] = value
    setOptions(prev => ({ ...prev, specialRequirements: newRequirements }))
  }

  const removeRequirement = (index: number) => {
    const newRequirements = (options.specialRequirements || []).filter((_, i) => i !== index)
    setOptions(prev => ({ ...prev, specialRequirements: newRequirements }))
  }

  const handleConfirm = () => {
    // Filter out empty values
    const cleanedOptions: DeepCustomizationOptions = {
      ...options,
      examples: options.examples?.filter(e => e.trim()),
      specialRequirements: options.specialRequirements?.filter(r => r.trim())
    }
    
    // Remove empty optional fields
    if (!cleanedOptions.role) delete cleanedOptions.role
    if (!cleanedOptions.format) delete cleanedOptions.format
    if (!cleanedOptions.tone) delete cleanedOptions.tone
    if (!cleanedOptions.additionalContext) delete cleanedOptions.additionalContext
    if (!cleanedOptions.examples?.length) delete cleanedOptions.examples
    if (!cleanedOptions.specialRequirements?.length) delete cleanedOptions.specialRequirements
    
    onConfirm(cleanedOptions)
  }

  return (
    <div className="animate-fade-in">
      <div className="backdrop-blur-xl bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <span className="text-xl">🎯</span>
            深度定制你的提示词
          </h3>
        </div>

        <div className="space-y-6">
          {/* 角色设定 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              AI 角色设定（可选）
            </label>
            <input
              type="text"
              value={options.role}
              onChange={(e) => updateOption('role', e.target.value)}
              placeholder="例如：你是一位经验丰富的产品经理..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 
                       text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-gray-800/70
                       focus:border-purple-500/50 transition-all duration-300"
            />
          </div>

          {/* 语气基调 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              语气基调（可选）
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['专业', '友好', '简洁', '详细', '正式', '轻松', '激励', '客观'].map(tone => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => updateOption('tone', options.tone === tone ? '' : tone)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    options.tone === tone
                      ? 'bg-purple-600/20 border border-purple-500/50 text-purple-300'
                      : 'bg-gray-800/40 border border-gray-700 text-gray-300 hover:bg-gray-800/60'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* 输出格式 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              输出格式（可选）
            </label>
            <textarea
              value={options.format}
              onChange={(e) => updateOption('format', e.target.value)}
              placeholder="例如：Markdown格式、编号列表、表格形式..."
              className="w-full h-20 px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 
                       text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-gray-800/70
                       focus:border-purple-500/50 transition-all duration-300 resize-none"
            />
          </div>

          {/* 额外上下文 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              额外背景信息（可选）
            </label>
            <textarea
              value={options.additionalContext}
              onChange={(e) => updateOption('additionalContext', e.target.value)}
              placeholder="提供更多背景信息帮助AI理解..."
              className="w-full h-20 px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 
                       text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-gray-800/70
                       focus:border-purple-500/50 transition-all duration-300 resize-none"
            />
          </div>

          {/* 特殊要求 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              特殊要求（可选）
            </label>
            {options.specialRequirements?.map((req, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder="输入特殊要求..."
                  className="flex-1 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 
                           text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-gray-800/70
                           focus:border-purple-500/50 transition-all duration-300"
                />
                {options.specialRequirements!.length > 1 && (
                  <button
                    onClick={() => removeRequirement(index)}
                    className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 
                             text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addRequirement}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              + 添加更多要求
            </button>
          </div>

          {/* 参考示例 */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              参考示例（可选）
            </label>
            {options.examples?.map((example, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs text-gray-400">示例 {index + 1}</span>
                  {options.examples!.length > 1 && (
                    <button
                      onClick={() => removeExample(index)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      删除
                    </button>
                  )}
                </div>
                <textarea
                  value={example}
                  onChange={(e) => updateExample(index, e.target.value)}
                  placeholder="提供一个理想输出的示例..."
                  className="w-full h-24 px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700 
                           text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-gray-800/70
                           focus:border-purple-500/50 transition-all duration-300 resize-none"
                />
              </div>
            ))}
            <button
              onClick={addExample}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              + 添加更多示例
            </button>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/90 to-blue-600/90 
                     text-white font-medium hover:from-purple-600 hover:to-blue-600 
                     transition-all duration-300"
          >
            应用定制设置
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