'use client'

import { OptimizationState } from '../types'
import OptimizationSettings from './OptimizationSettings'
import PromptInput from './PromptInput'
import OptimizationProcess from './OptimizationProcess'
import OptimizedResult from './OptimizedResult'

interface OptimizationDemoProps {
  optimizationState: OptimizationState
  setOptimizationState: (state: OptimizationState) => void
  enableStreaming: boolean
  setEnableStreaming: (enabled: boolean) => void
}

export default function OptimizationDemo({
  optimizationState,
  setOptimizationState,
  enableStreaming,
  setEnableStreaming,
}: OptimizationDemoProps) {
  const handlePromptSubmit = (prompt: string) => {
    setOptimizationState({
      ...optimizationState,
      originalPrompt: prompt,
      stage: 'analyzing',
    })
  }

  return (
    <section id="demo" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">立即体验</span>
          </h2>
          <p className="text-xl text-gray-400">见证提示词的完美蜕变</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Settings */}
            <div className="glass rounded-2xl p-6">
              <OptimizationSettings
                enableStreaming={enableStreaming}
                onStreamingChange={setEnableStreaming}
              />
            </div>

            {/* Input */}
            <div className="glass rounded-2xl p-6">
              <PromptInput 
                onSubmit={handlePromptSubmit}
                disabled={optimizationState.stage !== 'input'}
              />
            </div>
            
            {/* Process */}
            {optimizationState.stage !== 'input' && (
              <div className="glass rounded-2xl p-6">
                <OptimizationProcess 
                  state={optimizationState}
                  onStateChange={setOptimizationState}
                  useStreaming={enableStreaming}
                />
              </div>
            )}
          </div>

          {/* Result */}
          <div className="lg:col-span-1">
            {optimizationState.optimizedPrompt && (
              <div className="glass rounded-2xl p-6 sticky top-8">
                <OptimizedResult 
                  result={optimizationState.optimizedPrompt}
                  originalPrompt={optimizationState.originalPrompt}
                  dimensions={optimizationState.dimensions}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}