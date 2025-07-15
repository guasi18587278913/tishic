// 流式响应优化工具

interface StreamConfig {
  // 缓冲区大小（字节）
  bufferSize?: number
  // 最小发送间隔（毫秒）
  minSendInterval?: number
  // 最大等待时间（毫秒）
  maxWaitTime?: number
}

export class StreamOptimizer {
  private buffer: string[] = []
  private lastSendTime = 0
  private sendTimer: NodeJS.Timeout | null = null
  private config: Required<StreamConfig>

  constructor(config: StreamConfig = {}) {
    this.config = {
      bufferSize: 1024, // 1KB
      minSendInterval: 50, // 50ms
      maxWaitTime: 200, // 200ms
      ...config
    }
  }

  // 添加内容到缓冲区
  add(content: string): string | null {
    this.buffer.push(content)
    
    const currentSize = this.buffer.join('').length
    const timeSinceLastSend = Date.now() - this.lastSendTime
    
    // 如果缓冲区满了或者时间到了，立即发送
    if (currentSize >= this.config.bufferSize || 
        timeSinceLastSend >= this.config.maxWaitTime) {
      return this.flush()
    }
    
    // 否则设置延迟发送
    if (!this.sendTimer) {
      this.sendTimer = setTimeout(() => {
        this.flush()
      }, this.config.minSendInterval)
    }
    
    return null
  }

  // 清空缓冲区并返回内容
  flush(): string | null {
    if (this.buffer.length === 0) return null
    
    const content = this.buffer.join('')
    this.buffer = []
    this.lastSendTime = Date.now()
    
    if (this.sendTimer) {
      clearTimeout(this.sendTimer)
      this.sendTimer = null
    }
    
    return content
  }

  // 清理资源
  cleanup() {
    if (this.sendTimer) {
      clearTimeout(this.sendTimer)
      this.sendTimer = null
    }
    this.buffer = []
  }
}

// 流式响应的健康检查
export class StreamHealthChecker {
  private lastActivity = Date.now()
  private checker: NodeJS.Timeout | null = null
  
  constructor(
    private onTimeout: () => void,
    private timeoutMs = 30000,
    private checkInterval = 5000
  ) {}

  start() {
    this.updateActivity()
    this.checker = setInterval(() => {
      if (Date.now() - this.lastActivity > this.timeoutMs) {
        this.onTimeout()
        this.stop()
      }
    }, this.checkInterval)
  }

  updateActivity() {
    this.lastActivity = Date.now()
  }

  stop() {
    if (this.checker) {
      clearInterval(this.checker)
      this.checker = null
    }
  }
}

// 流式响应的连接池管理
export class StreamConnectionPool {
  private connections = new Map<string, AbortController>()
  private maxConnections = 5

  create(id: string): AbortController {
    // 如果连接池满了，关闭最旧的连接
    if (this.connections.size >= this.maxConnections) {
      const oldestId = this.connections.keys().next().value
      if (oldestId !== undefined) {
        this.close(oldestId)
      }
    }

    const controller = new AbortController()
    this.connections.set(id, controller)
    return controller
  }

  get(id: string): AbortController | undefined {
    return this.connections.get(id)
  }

  close(id: string) {
    const controller = this.connections.get(id)
    if (controller) {
      controller.abort()
      this.connections.delete(id)
    }
  }

  closeAll() {
    for (const controller of this.connections.values()) {
      controller.abort()
    }
    this.connections.clear()
  }
}