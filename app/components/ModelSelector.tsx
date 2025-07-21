'use client'

import { MODEL_CONFIGS } from '../lib/model-config'

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const models = Object.entries(MODEL_CONFIGS).map(([key, config]) => ({
    key,
    ...config
  }))

  const selectedModelConfig = MODEL_CONFIGS[selectedModel as keyof typeof MODEL_CONFIGS]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-200">
        选择优化模型
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {models.map((model) => {
          const isSelected = selectedModel === model.key
          
          return (
            <button
              key={model.key}
              type="button"
              onClick={() => {
                console.log('Model clicked:', model.key)
                onModelChange(model.key)
              }}
              className={`
                relative p-4 rounded-xl border transition-all duration-300 text-left cursor-pointer
                ${isSelected 
                  ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-400/60' 
                  : 'bg-gray-800/40 border-gray-700 hover:bg-gray-800/60 hover:border-gray-600'
                }
              `}
              style={{ zIndex: 10 }}
            >
              {model.key === 'claude-opus-4' && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xs text-white">
                  推荐
                </div>
              )}
              
              <div className="font-medium text-gray-100 mb-1">{model.name}</div>
              <div className="text-xs text-gray-300 mb-2 line-clamp-2">{model.description}</div>
              
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">质量</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < model.qualityScore / 2 
                            ? 'bg-purple-400' 
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">速度</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < model.speedScore / 2 
                            ? 'bg-blue-400' 
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute inset-0 rounded-xl border-2 border-purple-500/50 pointer-events-none" />
              )}
            </button>
          )
        })}
      </div>
      
      {selectedModelConfig && (
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          当前选择：{selectedModelConfig.name} - 最大 {selectedModelConfig.maxTokens} tokens
        </div>
      )}
    </div>
  )
}