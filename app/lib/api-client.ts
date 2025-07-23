import { getApiProvider, getModelId } from './api-providers'
import { fetchWithRetry } from './api-utils'

interface GenerateOptions {
  temperature?: number
  maxTokens?: number
  model?: string
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export class APIClient {
  private provider: any
  private apiKey: string

  constructor(apiKey?: string) {
    this.provider = getApiProvider()
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || ''
  }

  async generateResponse(prompt: string, options: GenerateOptions = {}): Promise<string> {
    const {
      temperature = 0.7,
      maxTokens = 2000,
      model = 'claude-3.5-sonnet'
    } = options

    const messages: Message[] = [
      {
        role: 'user',
        content: prompt
      }
    ]

    const modelId = getModelId(model)
    
    try {
      const response = await fetchWithRetry(`${this.provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.provider.headers(this.apiKey),
        body: JSON.stringify({
          model: modelId,
          messages,
          max_tokens: maxTokens,
          temperature,
          top_p: 0.9,
          presence_penalty: 0,
          frequency_penalty: 0,
        }),
        timeout: 60000, // 60 seconds timeout
        retries: 3
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`API request failed: ${response.statusText} - ${errorData}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('API generation error:', error)
      throw error
    }
  }
}

// 创建默认实例
export const apiClient = new APIClient()