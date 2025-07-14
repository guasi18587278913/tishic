// 预取优化 - 在用户输入时就开始准备
export class OptimizationPrefetcher {
  private prefetchCache = new Map<string, Promise<any>>()

  // 当用户开始输入时调用
  async prefetchAnalysis(prompt: string) {
    if (this.prefetchCache.has(prompt)) return

    // 预先分析提示词类型
    const prefetchPromise = fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'analyze',
        data: { prompt }
      })
    }).then(res => res.json())

    this.prefetchCache.set(prompt, prefetchPromise)
    
    // 5分钟后清理缓存
    setTimeout(() => {
      this.prefetchCache.delete(prompt)
    }, 5 * 60 * 1000)
  }

  async getAnalysis(prompt: string) {
    const cached = this.prefetchCache.get(prompt)
    if (cached) {
      return await cached
    }
    return null
  }
}

export const prefetcher = new OptimizationPrefetcher()