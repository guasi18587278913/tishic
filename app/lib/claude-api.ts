interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeResponse {
  content: Array<{
    text: string
    type: 'text'
  }>
}

export class ClaudeAPI {
  private apiKey: string
  private proxyUrl?: string

  constructor(apiKey: string, proxyUrl?: string) {
    this.apiKey = apiKey
    this.proxyUrl = proxyUrl
  }

  async sendMessage(messages: ClaudeMessage[]): Promise<string> {
    const url = this.proxyUrl 
      ? `${this.proxyUrl}/v1/messages`
      : 'https://api.anthropic.com/v1/messages'

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          messages,
          max_tokens: 4000,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data: ClaudeResponse = await response.json()
      return data.content[0]?.text || ''
    } catch (error) {
      console.error('Claude API error:', error)
      throw error
    }
  }
}

// 创建一个默认实例
export const claudeAPI = new ClaudeAPI(
  process.env.CLAUDE_API_KEY || '',
  process.env.CLAUDE_API_PROXY
)