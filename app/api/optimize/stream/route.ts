import { NextRequest } from 'next/server'
import { analyzePromptType, buildOptimizationPrompt } from '@/app/lib/prompt-optimizer'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { originalPrompt, promptType, answers } = body

  // 构建优化提示词
  const optimizationPrompt = buildOptimizationPrompt(originalPrompt, promptType, answers)

  // 创建流式响应
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const timeout = setTimeout(() => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Request timeout' })}\n\n`)
        )
        controller.close()
      }, 120000) // 120秒超时

      try {
        // 使用 Gemini API
        const apiKey = process.env.GOOGLE_API_KEY
        if (!apiKey) {
          throw new Error('Google API key not configured')
        }
        
        console.log('Using Gemini 2.5 Pro for optimization')
        
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-pro-latest',
          generationConfig: {
            maxOutputTokens: 32768,
            temperature: 0.7,
          }
        })
        
        const result = await model.generateContentStream(optimizationPrompt)
        
        let totalContent = ''
        let chunkCount = 0
        
        // 处理流式响应
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            totalContent += text
            chunkCount++
            
            // 每10个chunk记录一次
            if (chunkCount % 10 === 0) {
              console.log(`Streamed ${chunkCount} chunks, total length: ${totalContent.length}`)
            }
            
            // 转换为 OpenAI 格式以保持前端兼容
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                choices: [{ delta: { content: text } }] 
              })}\n\n`)
            )
          }
        }
        
        console.log(`Stream complete. Total chunks: ${chunkCount}, Total length: ${totalContent.length}`)
        console.log('First 500 chars:', totalContent.substring(0, 500))
        console.log('Last 500 chars:', totalContent.substring(Math.max(0, totalContent.length - 500)))
        
        // 发送结束信号
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        clearTimeout(timeout)
        
      } catch (error: any) {
        console.error('Gemini API Error:', error)
        clearTimeout(timeout)
        
        // 发送错误信息
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ 
            error: error.message || 'Gemini API request failed',
            details: error.toString()
          })}\n\n`)
        )
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}