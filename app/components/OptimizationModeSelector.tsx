'use client'

export type OptimizationMode = 'instant' | 'smart' | 'deep'

interface OptimizationModeSelectorProps {
  selectedMode: OptimizationMode
  onModeChange: (mode: OptimizationMode) => void
  disabled?: boolean
}

const OPTIMIZATION_MODES = [
  {
    id: 'instant' as OptimizationMode,
    icon: '⚡',
    title: '立即优化',
    description: '一键生成，无需等待',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'smart' as OptimizationMode,
    icon: '✨',
    title: '智能优化',
    description: 'AI推荐，一次确认',
    color: 'from-purple-500 to-pink-500',
    recommended: true
  },
  {
    id: 'deep' as OptimizationMode,
    icon: '🎯',
    title: '深度定制',
    description: '完全控制，精确调整',
    color: 'from-blue-500 to-cyan-500'
  }
]

export default function OptimizationModeSelector({ 
  selectedMode, 
  onModeChange, 
  disabled = false 
}: OptimizationModeSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-200 mb-3">
        选择优化深度
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {OPTIMIZATION_MODES.map((mode) => {
          const isSelected = selectedMode === mode.id
          
          return (
            <button
              key={mode.id}
              type="button"
              disabled={disabled}
              onClick={() => onModeChange(mode.id)}
              className={`
                relative p-4 rounded-xl border transition-all duration-300 cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected 
                  ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-400/60' 
                  : 'bg-gray-800/40 border-gray-700 hover:bg-gray-800/60 hover:border-gray-600'
                }
              `}
            >
              {mode.recommended && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs text-white">
                  推荐
                </div>
              )}
              
              <div className="text-2xl mb-2">{mode.icon}</div>
              <div className="text-sm font-medium text-gray-100 mb-1">{mode.title}</div>
              <div className="text-xs text-gray-400">{mode.description}</div>
              
              {isSelected && (
                <div className="absolute inset-0 rounded-xl border-2 border-purple-500/50 pointer-events-none" />
              )}
            </button>
          )
        })}
      </div>
      
      {selectedMode === 'smart' && (
        <div className="mt-3 text-xs text-purple-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          智能模式会分析你的需求并提供优化建议，你可以快速确认或调整
        </div>
      )}
    </div>
  )
}