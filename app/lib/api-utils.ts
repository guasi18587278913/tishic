// API 工具函数：防抖、重试、超时控制

interface RequestOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null
  let lastResolve: ((value: any) => void) | null = null
  
  return (...args: Parameters<T>) => {
    return new Promise<ReturnType<T>>((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      lastResolve = resolve
      
      timeoutId = setTimeout(async () => {
        const result = await func(...args)
        if (lastResolve === resolve) {
          resolve(result)
        }
      }, wait)
    })
  }
}

// 带重试的 fetch
export async function fetchWithRetry(
  url: string,
  options: RequestInit & RequestOptions = {}
): Promise<Response> {
  const {
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options

  let lastError: Error | null = null

  for (let i = 0; i < retries; i++) {
    try {
      // 创建超时控制
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok && response.status >= 500) {
        // 服务器错误，重试
        throw new Error(`Server error: ${response.status}`)
      }

      return response
    } catch (error) {
      lastError = error as Error
      
      // 如果是最后一次重试，直接抛出错误
      if (i === retries - 1) {
        throw lastError
      }

      // 等待后重试，指数退避
      await new Promise(resolve => 
        setTimeout(resolve, retryDelay * Math.pow(2, i))
      )
    }
  }

  throw lastError || new Error('Request failed')
}

// 请求队列管理
class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private processing = false
  private concurrency = 2 // 并发请求数

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      
      this.process()
    })
  }

  private async process() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true
    const batch = this.queue.splice(0, this.concurrency)

    await Promise.all(
      batch.map(request => request().catch(console.error))
    )

    this.processing = false
    
    // 继续处理剩余请求
    if (this.queue.length > 0) {
      this.process()
    }
  }
}

export const requestQueue = new RequestQueue()

// 创建一个带缓存的 API 调用函数
export function createCachedApiCall<TArgs extends any[], TResult>(
  apiCall: (...args: TArgs) => Promise<TResult>,
  getCacheKey: (...args: TArgs) => string,
  cacheDuration = 1000 * 60 * 5 // 5分钟
) {
  const cache = new Map<string, { result: TResult; timestamp: number }>()

  return async (...args: TArgs): Promise<TResult> => {
    const key = getCacheKey(...args)
    const cached = cache.get(key)

    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.result
    }

    const result = await apiCall(...args)
    cache.set(key, { result, timestamp: Date.now() })

    // 限制缓存大小
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      if (firstKey) cache.delete(firstKey)
    }

    return result
  }
}