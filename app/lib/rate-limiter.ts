import { NextRequest, NextResponse } from 'next/server'

// 速率限制中间件
interface RateLimitConfig {
  windowMs: number      // 时间窗口（毫秒）
  maxRequests: number   // 最大请求数
  message?: string      // 限制时的错误消息
  skipSuccessfulRequests?: boolean  // 是否跳过成功的请求
  keyGenerator?: (req: NextRequest) => string  // 生成限制键的函数
}

interface RateLimitStore {
  requests: number
  resetTime: number
}

class RateLimiter {
  private store: Map<string, RateLimitStore> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null
  
  constructor(private config: RateLimitConfig) {
    // 定期清理过期的记录
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, Math.min(config.windowMs, 60000)) // 最多每分钟清理一次
  }
  
  private cleanup(): void {
    const now = Date.now()
    for (const [key, data] of this.store.entries()) {
      if (data.resetTime <= now) {
        this.store.delete(key)
      }
    }
  }
  
  private getKey(req: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req)
    }
    
    // 默认使用 IP 地址作为限制键
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    
    // 结合路径，为不同的端点设置独立的限制
    const pathname = new URL(req.url).pathname
    return `${ip}:${pathname}`
  }
  
  async checkLimit(req: NextRequest): Promise<NextResponse | null> {
    const key = this.getKey(req)
    const now = Date.now()
    
    let data = this.store.get(key)
    
    if (!data || data.resetTime <= now) {
      // 创建新的时间窗口
      data = {
        requests: 1,
        resetTime: now + this.config.windowMs
      }
      this.store.set(key, data)
      return null // 允许请求
    }
    
    // 增加请求计数
    data.requests++
    
    if (data.requests > this.config.maxRequests) {
      // 超过限制
      const retryAfter = Math.ceil((data.resetTime - now) / 1000)
      
      return NextResponse.json(
        {
          error: this.config.message || 'Too many requests, please try again later.',
          retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': this.config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(data.resetTime).toISOString()
          }
        }
      )
    }
    
    // 未超过限制，更新存储
    this.store.set(key, data)
    
    // 可以在响应头中添加速率限制信息
    return null
  }
  
  // 获取当前限制状态
  getStatus(req: NextRequest): {
    limit: number
    remaining: number
    reset: Date
  } {
    const key = this.getKey(req)
    const data = this.store.get(key)
    const now = Date.now()
    
    if (!data || data.resetTime <= now) {
      return {
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        reset: new Date(now + this.config.windowMs)
      }
    }
    
    return {
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - data.requests),
      reset: new Date(data.resetTime)
    }
  }
  
  // 清理资源
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
  }
}

// 创建不同级别的限制器
export const strictRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,     // 1分钟
  maxRequests: 10,         // 最多10个请求
  message: '请求过于频繁，请1分钟后再试'
})

export const normalRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,     // 1分钟
  maxRequests: 30,         // 最多30个请求
  message: '请求过于频繁，请稍后再试'
})

export const relaxedRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,     // 1分钟
  maxRequests: 60,         // 最多60个请求
  message: '请求过于频繁，请稍后再试'
})

// 中间件包装函数
export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>,
  limiter: RateLimiter = normalRateLimiter
): Promise<NextResponse> {
  // 检查速率限制
  const limitResponse = await limiter.checkLimit(req)
  if (limitResponse) {
    return limitResponse
  }
  
  // 执行原始处理器
  const response = await handler()
  
  // 添加速率限制头
  const status = limiter.getStatus(req)
  response.headers.set('X-RateLimit-Limit', status.limit.toString())
  response.headers.set('X-RateLimit-Remaining', status.remaining.toString())
  response.headers.set('X-RateLimit-Reset', status.reset.toISOString())
  
  return response
}

// IP 白名单
const IP_WHITELIST = new Set([
  '127.0.0.1',
  'localhost',
  '::1'
])

// 创建自定义键生成器（可以基于用户ID、API密钥等）
export function createKeyGenerator(options: {
  byIP?: boolean
  byPath?: boolean
  byHeader?: string
  byQuery?: string
}): (req: NextRequest) => string {
  return (req: NextRequest) => {
    const parts: string[] = []
    
    if (options.byIP !== false) {
      const forwarded = req.headers.get('x-forwarded-for')
      const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
      
      // 检查白名单
      if (!IP_WHITELIST.has(ip)) {
        parts.push(ip)
      }
    }
    
    if (options.byPath !== false) {
      const pathname = new URL(req.url).pathname
      parts.push(pathname)
    }
    
    if (options.byHeader) {
      const headerValue = req.headers.get(options.byHeader) || 'unknown'
      parts.push(headerValue)
    }
    
    if (options.byQuery) {
      const url = new URL(req.url)
      const queryValue = url.searchParams.get(options.byQuery) || 'unknown'
      parts.push(queryValue)
    }
    
    return parts.join(':')
  }
}