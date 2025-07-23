/**
 * Client-side API wrapper for clarity analysis
 * This calls the server-side API routes to avoid exposing API keys
 */

interface GenerateOptions {
  temperature?: number
  maxTokens?: number
  model?: string
}

export class ClarityAPIClient {
  async generateResponse(prompt: string, options: GenerateOptions = {}): Promise<string> {
    try {
      const response = await fetch('/api/clarity/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, options }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'API request failed')
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('Clarity API error:', error)
      throw error
    }
  }
}

// 创建默认实例
export const clarityAPIClient = new ClarityAPIClient()