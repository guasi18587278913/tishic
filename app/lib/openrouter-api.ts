import { CURRENT_MODEL } from './model-config'

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
    this.model = model || CURRENT_MODEL
  }

  async sendMessage(messages: OpenRouterMessage[], options?: { model?: string }): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://prompt-optimizer.vercel.app', // 你的网站地址
          'X-Title': 'Prompt Optimizer', // 应用名称
        },
        body: JSON.stringify({
          model: options?.model || this.model,
          messages,
          max_tokens: 4000,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`API request failed: ${response.statusText} - ${errorData}`)
      }

      const data: OpenRouterResponse = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenRouter API error:', error)
      throw error
    }
  }
}

// 创建一个默认实例
export const openRouterAPI = new OpenRouterAPI(
  process.env.OPENROUTER_API_KEY || ''
)