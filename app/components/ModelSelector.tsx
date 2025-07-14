'use client'

import { useState } from 'react'
import { MODEL_CONFIGS } from '../lib/model-config'

interface ModelSelectorProps {
  onModelChange: (model: string) => void
}

export default function ModelSelector({ onModelChange }: ModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState('claude-3.7-sonnet')

  const handleChange = (model: string) => {
    setSelectedModel(model)
    onModelChange(MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS].id)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">选择AI模型</h3>
      <div className="space-y-2">
        {Object.entries(MODEL_CONFIGS).map(([key, config]) => (
          <label key={key} className="flex items-start cursor-pointer">
            <input
              type="radio"
              name="model"
              value={key}
              checked={selectedModel === key}
              onChange={() => handleChange(key)}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{config.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  config.speed === '非常快' ? 'bg-green-100 text-green-700' :
                  config.speed === '中等' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {config.speed}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{config.description}</p>
              <p className="text-xs text-gray-500 mt-1">费用: {config.cost}</p>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          💡 提示：Sonnet 模型在速度和效果之间达到最佳平衡，适合大多数场景
        </p>
      </div>
    </div>
  )
}