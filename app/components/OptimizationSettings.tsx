'use client'

interface OptimizationSettingsProps {
  enableStreaming: boolean
  onStreamingChange: (enabled: boolean) => void
}

export default function OptimizationSettings({ 
  enableStreaming, 
  onStreamingChange 
}: OptimizationSettingsProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-300">优化设置</span>
        </div>
        
        <label className="flex items-center cursor-pointer">
          <span className="text-sm text-gray-400 mr-3">流式响应</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={enableStreaming}
              onChange={(e) => onStreamingChange(e.target.checked)}
              className="sr-only"
            />
            <div className={`block w-14 h-8 rounded-full ${enableStreaming ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-700'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enableStreaming ? 'translate-x-6' : ''}`}></div>
          </div>
        </label>
      </div>
      
      <p className="text-xs text-gray-400 mt-2">
        {enableStreaming 
          ? '✅ 实时显示优化内容，提升等待体验' 
          : '⏱️ 等待完整生成后一次性显示'}
      </p>
    </div>
  )
}