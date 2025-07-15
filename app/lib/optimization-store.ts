// 优化流程状态管理

import { OptimizationState } from '../types'

interface StoredState {
  state: OptimizationState
  timestamp: number
  version: string
}

class OptimizationStore {
  private readonly STORAGE_KEY = 'optimization-progress'
  private readonly VERSION = '1.0.0'
  private readonly MAX_AGE = 24 * 60 * 60 * 1000 // 24小时

  // 保存状态到 localStorage 和 sessionStorage
  saveState(state: OptimizationState) {
    if (typeof window === 'undefined') return

    const storedState: StoredState = {
      state,
      timestamp: Date.now(),
      version: this.VERSION,
    }

    try {
      // sessionStorage 用于浏览器会话期间的状态保持
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedState))
      
      // localStorage 用于长期保存（如果用户想继续之前的优化）
      if (state.stage !== 'input' && state.originalPrompt) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedState))
      }
    } catch (error) {
      console.error('Failed to save optimization state:', error)
    }
  }

  // 从存储中恢复状态
  loadState(): OptimizationState | null {
    if (typeof window === 'undefined') return null

    try {
      // 优先从 sessionStorage 读取（当前会话）
      let stored = sessionStorage.getItem(this.STORAGE_KEY)
      
      // 如果没有，尝试从 localStorage 读取（之前的会话）
      if (!stored) {
        stored = localStorage.getItem(this.STORAGE_KEY)
      }

      if (!stored) return null

      const parsed: StoredState = JSON.parse(stored)

      // 检查版本兼容性
      if (parsed.version !== this.VERSION) {
        this.clearState()
        return null
      }

      // 检查是否过期
      if (Date.now() - parsed.timestamp > this.MAX_AGE) {
        this.clearState()
        return null
      }

      return parsed.state
    } catch (error) {
      console.error('Failed to load optimization state:', error)
      return null
    }
  }

  // 清除保存的状态
  clearState() {
    if (typeof window === 'undefined') return

    try {
      sessionStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear optimization state:', error)
    }
  }

  // 保存到浏览器历史状态
  pushHistoryState(state: OptimizationState) {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    
    // 根据阶段更新URL
    if (state.stage === 'input') {
      url.searchParams.delete('stage')
      url.searchParams.delete('prompt')
    } else {
      url.searchParams.set('stage', state.stage)
      if (state.originalPrompt) {
        url.searchParams.set('prompt', encodeURIComponent(state.originalPrompt))
      }
    }

    window.history.pushState(
      { optimizationState: state },
      '',
      url.toString()
    )
  }

  // 替换浏览器历史状态（不创建新历史记录）
  replaceHistoryState(state: OptimizationState) {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    
    if (state.stage === 'input') {
      url.searchParams.delete('stage')
      url.searchParams.delete('prompt')
    } else {
      url.searchParams.set('stage', state.stage)
      if (state.originalPrompt) {
        url.searchParams.set('prompt', encodeURIComponent(state.originalPrompt))
      }
    }

    window.history.replaceState(
      { optimizationState: state },
      '',
      url.toString()
    )
  }

  // 从历史状态恢复
  getHistoryState(): OptimizationState | null {
    if (typeof window === 'undefined') return null

    const state = window.history.state
    return state?.optimizationState || null
  }
}

export const optimizationStore = new OptimizationStore()

// 导出便捷方法
export const saveOptimizationProgress = (state: OptimizationState) => {
  optimizationStore.saveState(state)
  optimizationStore.replaceHistoryState(state)
}

export const loadOptimizationProgress = (): OptimizationState | null => {
  // 优先从历史状态恢复
  const historyState = optimizationStore.getHistoryState()
  if (historyState) return historyState

  // 否则从存储恢复
  return optimizationStore.loadState()
}

export const clearOptimizationProgress = () => {
  optimizationStore.clearState()
}