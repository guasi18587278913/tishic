'use client'

import { OptimizationState } from '../types'
import OptimizationFlow from './OptimizationFlow'

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
  return (
    <OptimizationFlow
      optimizationState={optimizationState}
      setOptimizationState={setOptimizationState}
      enableStreaming={enableStreaming}
      setEnableStreaming={setEnableStreaming}
    />
  )
}