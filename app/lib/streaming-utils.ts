// 流式响应处理工具

export interface StreamOptions {
  onChunk?: (chunk: string) => void
  onError?: (error: Error) => void
  onComplete?: () => void
  signal?: AbortSignal
}

export class StreamProcessor {
  private decoder = new TextDecoder()
  private buffer = ''

  async processStream(
    response: Response,
    options: StreamOptions = {}
  ): Promise<string> {
    const { onChunk, onError, onComplete, signal } = options
    const reader = response.body?.getReader()
    
    if (!reader) {
      throw new Error('No response body')
    }

    let fullContent = ''

    try {
      while (true) {
        if (signal?.aborted) {
          reader.cancel()
          break
        }

        const { done, value } = await reader.read()
        if (done) break

        // 解码数据
        this.buffer += this.decoder.decode(value, { stream: true })
        const lines = this.buffer.split('\n')
        this.buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              onComplete?.()
              continue
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.content || parsed.choices?.[0]?.delta?.content
              
              if (content) {
                fullContent += content
                onChunk?.(content)
              }
            } catch (e) {
              console.error('Failed to parse stream data:', e)
            }
          }
        }
      }
    } catch (error) {
      onError?.(error as Error)
      throw error
    } finally {
      reader.releaseLock()
    }

    return fullContent
  }
}

// 创建一个带重连的 EventSource
export class ReconnectingEventSource {
  private eventSource: EventSource | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(
    private url: string,
    private options: {
      onMessage: (data: any) => void
      onError?: (error: Error) => void
      onOpen?: () => void
      onClose?: () => void
    }
  ) {
    this.connect()
  }

  private connect() {
    try {
      this.eventSource = new EventSource(this.url)
      
      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0
        this.options.onOpen?.()
      }

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.options.onMessage(data)
        } catch (error) {
          console.error('Failed to parse message:', error)
        }
      }

      this.eventSource.onerror = (error) => {
        console.error('EventSource error:', error)
        this.options.onError?.(new Error('Connection error'))
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++
            this.reconnect()
          }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts))
        }
      }
    } catch (error) {
      this.options.onError?.(error as Error)
    }
  }

  private reconnect() {
    this.close()
    this.connect()
  }

  close() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
      this.options.onClose?.()
    }
  }
}