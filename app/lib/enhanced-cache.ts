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

  constructor() {
    // 启动时从 localStorage 加载缓存
    this.loadFromStorage()
  }

  private generateKey(prompt: string, answers: Record<string, string>): string {
    // 使用更稳定的 key 生成策略
    const sortedAnswers = Object.keys(answers).sort().reduce((acc, key) => {
      acc[key] = answers[key]
      return acc
    }, {} as Record<string, string>)
    
    return btoa(encodeURIComponent(`${prompt.trim()}-${JSON.stringify(sortedAnswers)}`))
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 64)
  }

  private loadFromStorage(): void {
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
        this.saveToStorage()
      }
    }
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
    
    // 异步保存到 localStorage
    setTimeout(() => this.saveToStorage(), 0)
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
    localStorage.removeItem(this.storageKey)
  }

  // 预加载相关提示词的优化结果
  async prefetch(prompts: string[]): Promise<void> {
    // 这里可以实现预加载逻辑
    console.log('Prefetching prompts:', prompts)
  }
}

export const enhancedCache = new EnhancedOptimizationCache()