// 简单的内存缓存实现
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

class OptimizationCache {
  private cache: Map<string, CacheItem> = new Map()
  private maxAge = 1000 * 60 * 60 * 24 // 24小时

  generateKey(prompt: string, answers: Record<string, string>): string {
    return `${prompt}-${JSON.stringify(answers)}`
  }

  get(prompt: string, answers: Record<string, string>): CacheItem | null {
    const key = this.generateKey(prompt, answers)
    const item = this.cache.get(key)
    
    if (!item) return null
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }
    
    return item
  }

  set(
    prompt: string,
    type: string,
    answers: Record<string, string>,
    result: { optimizedPrompt: string; dimensions: any }
  ): void {
    const key = this.generateKey(prompt, answers)
    this.cache.set(key, {
      prompt,
      type,
      answers,
      result,
      timestamp: Date.now()
    })
    
    // 限制缓存大小
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }
}

export const optimizationCache = new OptimizationCache()