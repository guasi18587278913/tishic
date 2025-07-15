import { GoogleGenerativeAI } from '@google/generative-ai'

export class GeminiAPI {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro-latest',
      generationConfig: {
        maxOutputTokens: 32768,
        temperature: 0.7,
      }
    })
  }

  async sendMessage(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }

  async streamMessage(prompt: string, onChunk: (text: string) => void): Promise<void> {
    try {
      const result = await this.model.generateContentStream(prompt)
      
      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) {
          onChunk(text)
        }
      }
    } catch (error) {
      console.error('Gemini streaming error:', error)
      throw error
    }
  }
}

// 创建单例实例
export const geminiAPI = new GeminiAPI(process.env.GOOGLE_API_KEY || '')