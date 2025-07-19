import { getUserPreferredModel } from './model-config'

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface OpenRouterResponse {
  id: string
  model: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
}

export class OpenRouterAPI {
  private apiKey: string
  private baseUrl: string = 'https://openrouter.ai/api/v1'
  private model: string

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey
    this.model = model || getUserPreferredModel()
  }

  async sendMessage(messages: OpenRouterMessage[], options?: { model?: string }): Promise<string> {
    let retries = 3
    let lastError: Error | null = null
    
    while (retries > 0) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://tishic.netlify.app', // 你的网站地址
            'X-Title': 'Prompt Optimizer', // 应用名称
          },
          body: JSON.stringify({
            model: options?.model || this.model,
            messages,
            max_tokens: 16000, // 增加到 16000 以支持完整输出
            temperature: 0.7,
            top_p: 0.9,
            presence_penalty: 0,
            frequency_penalty: 0,
          }),
        })

        if (!response.ok) {
          const errorData = await response.text()
          lastError = new Error(`API request failed: ${response.statusText} - ${errorData}`)
          
          // 如果是429错误（速率限制），等待后重试
          if (response.status === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            retries--
            continue
          }
          throw lastError
        }

        const data: OpenRouterResponse = await response.json()
        return data.choices[0]?.message?.content || ''
      } catch (error) {
        console.error('OpenRouter API error:', error)
        lastError = error as Error
        retries--
        
        if (retries > 0) {
          // 等待一秒后重试
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }
    
    throw lastError || new Error('API request failed after retries')
  }
}

// 创建一个默认实例
export const openRouterAPI = new OpenRouterAPI(
  process.env.OPENROUTER_API_KEY || ''
)