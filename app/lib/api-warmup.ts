// API 预热和预加载策略

interface WarmupConfig {
  endpoints: string[]
  priority: 'high' | 'low'
  method?: 'GET' | 'POST'
  body?: any
}

class APIWarmup {
  private warmupQueue: WarmupConfig[] = []
  private isWarmedUp = false
  private warmupPromise: Promise<void> | null = null

  constructor() {
    // 监听页面可见性变化
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !this.isWarmedUp) {
          this.startWarmup()
        }
      })
    }
  }

  // 添加预热任务
  addWarmupTask(config: WarmupConfig) {
    this.warmupQueue.push(config)
  }

  // 开始预热
  async startWarmup() {
    if (this.isWarmedUp || this.warmupPromise) {
      return this.warmupPromise
    }

    this.warmupPromise = this.performWarmup()
    return this.warmupPromise
  }

  private async performWarmup() {
    console.log('Starting API warmup...')
    
    // 按优先级排序
    const sortedTasks = this.warmupQueue.sort((a, b) => 
      a.priority === 'high' ? -1 : 1
    )

    // 并行执行高优先级任务
    const highPriorityTasks = sortedTasks.filter(t => t.priority === 'high')
    const lowPriorityTasks = sortedTasks.filter(t => t.priority === 'low')

    try {
      // 执行高优先级预热
      await Promise.all(
        highPriorityTasks.map(task => this.warmupEndpoint(task))
      )

      // 延迟执行低优先级预热
      setTimeout(() => {
        lowPriorityTasks.forEach(task => this.warmupEndpoint(task))
      }, 1000)

      this.isWarmedUp = true
      console.log('API warmup completed')
    } catch (error) {
      console.error('API warmup failed:', error)
    }
  }

  private async warmupEndpoint(config: WarmupConfig) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

      const options: RequestInit = {
        method: config.method || 'GET',
        signal: controller.signal,
        headers: {
          'X-Warmup-Request': 'true',
        },
      }

      if (config.body) {
        options.body = JSON.stringify(config.body)
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
        }
      }

      await fetch(config.endpoints[0], options)
      clearTimeout(timeoutId)
    } catch (error) {
      // 静默失败，不影响用户体验
      console.debug('Warmup request failed:', error)
    }
  }

  // 预连接到API服务器
  static setupPreconnect() {
    if (typeof document === 'undefined') return

    const apiHosts = [
      'https://api.anthropic.com',
      'https://openrouter.ai',
    ]

    apiHosts.forEach(host => {
      // DNS 预解析
      const dnsPrefetch = document.createElement('link')
      dnsPrefetch.rel = 'dns-prefetch'
      dnsPrefetch.href = host
      document.head.appendChild(dnsPrefetch)

      // 预连接
      const preconnect = document.createElement('link')
      preconnect.rel = 'preconnect'
      preconnect.href = host
      preconnect.crossOrigin = 'anonymous'
      document.head.appendChild(preconnect)
    })
  }
}

export const apiWarmup = new APIWarmup()

// 预定义的预热任务
export const setupDefaultWarmupTasks = () => {
  // 预热优化 API
  apiWarmup.addWarmupTask({
    endpoints: ['/api/optimize'],
    priority: 'high',
    method: 'POST',
    body: {
      action: 'analyze',
      data: { prompt: '写一篇文章' } // 通用示例
    }
  })

  // 预热流式 API
  apiWarmup.addWarmupTask({
    endpoints: ['/api/optimize/stream'],
    priority: 'low',
    method: 'POST',
    body: {
      originalPrompt: '示例',
      promptType: 'creative',
      answers: {}
    }
  })
}