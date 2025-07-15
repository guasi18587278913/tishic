'use client'

import { useEffect, useState } from 'react'

interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
}

// 全局加载状态管理
class LoadingManager {
  private listeners: Set<(state: LoadingState) => void> = new Set()
  private state: LoadingState = { isLoading: false }

  subscribe(listener: (state: LoadingState) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  setState(state: LoadingState) {
    this.state = state
    this.listeners.forEach(listener => listener(state))
  }

  show(message?: string, progress?: number) {
    this.setState({ isLoading: true, message, progress })
  }

  hide() {
    this.setState({ isLoading: false })
  }
}

export const loadingManager = new LoadingManager()

export default function GlobalLoadingIndicator() {
  const [state, setState] = useState<LoadingState>({ isLoading: false })

  useEffect(() => {
    return loadingManager.subscribe(setState)
  }, [])

  if (!state.isLoading) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 顶部进度条 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800/50">
        <div 
          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
          style={{ 
            width: state.progress ? `${state.progress}%` : '100%',
            animation: !state.progress ? 'loading-bar 2s ease-in-out infinite' : undefined
          }}
        />
      </div>

      {/* 中心加载提示 */}
      {state.message && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="glass-card rounded-lg px-6 py-4 flex items-center space-x-3 pointer-events-auto">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500" />
            <span className="text-sm text-gray-300">{state.message}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}