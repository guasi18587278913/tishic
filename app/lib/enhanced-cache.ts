// 增强的缓存实现，支持 localStorage 持久化
interface CacheItem {
  prompt: string
  type: string
  answers: Record<string, string>
  result: {
    optimizedPrompt: string
    dimensions: any
  }
  timestamp: number
}

class EnhancedOptimizationCache {
  private memoryCache: Map<string, CacheItem> = new Map()
  private maxAge = 1000 * 60 * 60 * 24 * 7 // 7天
  private maxSize = 500 // 最大缓存数量
  private storageKey = 'prompt-optimizer-cache'
  private isClient = typeof window !== 'undefined'
  private saveTimeout: NodeJS.Timeout | null = null
  private saveDebounceMs = 1000 // 防抖延迟时间

  constructor() {
    // 启动时从 localStorage 加载缓存
    if (this.isClient) {
      this.loadFromStorage()
    }
  }

  private generateKey(prompt: string, answers: Record<string, string>): string {
    // 使用更稳定的 key 生成策略
    const sortedAnswers = Object.keys(answers).sort().reduce((acc, key) => {
      acc[key] = answers[key]
      return acc
    }, {} as Record<string, string>)
    
    // 使用更安全的编码方式，避免 btoa 对非 ASCII 字符的问题
    const keyString = `${prompt.trim()}-${JSON.stringify(sortedAnswers)}`
    
    // 简单的哈希函数
    let hash = 0
    for (let i = 0; i < keyString.length; i++) {
      const char = keyString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    
    return `cache_${Math.abs(hash)}_${keyString.length}`
  }

  private isStorageAvailable(): boolean {
    if (!this.isClient) return false
    
    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  private loadFromStorage(): void {
    if (!this.isStorageAvailable()) return
    
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const items: CacheItem[] = JSON.parse(stored)
        items.forEach(item => {
          if (Date.now() - item.timestamp < this.maxAge) {
            this.memoryCache.set(this.generateKey(item.prompt, item.answers), item)
          }
        })
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error)
    }
  }

  private saveToStorage(): void {
    if (!this.isStorageAvailable()) return
    
    // 使用防抖，避免频繁写入
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
    
    this.saveTimeout = setTimeout(() => {
      try {
        const items = Array.from(this.memoryCache.values())
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, this.maxSize)
        
        localStorage.setItem(this.storageKey, JSON.stringify(items))
      } catch (error) {
        console.error('Failed to save cache to storage:', error)
        // 如果存储空间满了，清理旧数据
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          this.cleanup()
          // 递归调用可能导致无限循环，改为直接尝试保存一半的数据
          try {
            const items = Array.from(this.memoryCache.values())
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, Math.floor(this.maxSize / 2))
            localStorage.setItem(this.storageKey, JSON.stringify(items))
          } catch {
            console.error('Failed to save cache even after cleanup')
          }
        }
      }
    }, this.saveDebounceMs)
  }

  get(prompt: string, answers: Record<string, string>): CacheItem | null {
    const key = this.generateKey(prompt, answers)
    const item = this.memoryCache.get(key)
    
    if (!item) return null
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.maxAge) {
      this.memoryCache.delete(key)
      this.saveToStorage()
      return null
    }
    
    // 更新访问时间以实现 LRU
    item.timestamp = Date.now()
    this.memoryCache.set(key, item)
    
    return item
  }

  set(
    prompt: string,
    type: string,
    answers: Record<string, string>,
    result: { optimizedPrompt: string; dimensions: any }
  ): void {
    const key = this.generateKey(prompt, answers)
    const item: CacheItem = {
      prompt,
      type,
      answers,
      result,
      timestamp: Date.now()
    }
    
    this.memoryCache.set(key, item)
    
    // 限制缓存大小
    if (this.memoryCache.size > this.maxSize) {
      this.cleanup()
    }
    
    // 异步保存到 localStorage（使用防抖）
    this.saveToStorage()
  }

  private cleanup(): void {
    // 按时间戳排序，删除最旧的项目
    const sorted = Array.from(this.memoryCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    // 删除最旧的 20% 项目
    const toDelete = Math.floor(sorted.length * 0.2)
    for (let i = 0; i < toDelete; i++) {
      this.memoryCache.delete(sorted[i][0])
    }
  }

  clear(): void {
    this.memoryCache.clear()
    if (this.isStorageAvailable()) {
      localStorage.removeItem(this.storageKey)
    }
    // 清理定时器
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
  }

  // 预加载相关提示词的优化结果
  async prefetch(prompts: string[]): Promise<void> {
    // 这里可以实现预加载逻辑
    console.log('Prefetching prompts:', prompts)
  }
}

export const enhancedCache = new EnhancedOptimizationCache()