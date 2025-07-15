'use client'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stage: string
}

export default function ProgressIndicator({ currentStep, totalSteps, stage }: ProgressIndicatorProps) {
  if (stage === 'input' || stage === 'complete') return null
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">优化进度</span>
          <span className="text-sm text-teal-400">{currentStep} / {totalSteps}</span>
        </div>
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}