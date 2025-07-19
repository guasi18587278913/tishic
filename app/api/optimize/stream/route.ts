import { NextRequest } from 'next/server'
import { analyzePromptType, buildOptimizationPrompt } from '@/app/lib/prompt-optimizer'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { validateStreamRequest, ValidationException } from '@/app/lib/validation'
import { getGoogleApiKey, getOpenRouterApiKey, getApiProvider, getModelName } from '@/app/lib/env-validation'

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // 验证请求
  let validated: { originalPrompt: string; promptType: any; answers: Record<string, string> }
  try {
    validated = validateStreamRequest(body)
  } catch (error) {
    if (error instanceof ValidationException) {
      return new Response(JSON.stringify({ 
        error: 'Validation failed',
        errors: error.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    throw error
  }
  
  const { originalPrompt, promptType, answers } = validated

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
        // 根据 API 提供商选择不同的处理方式
        const provider = getApiProvider()
        const modelName = getModelName()
        console.log(`Using ${modelName} for optimization via ${provider}`)
        
        if (provider === 'openrouter') {
          // 使用 OpenRouter API (不支持流式响应，使用 fetch 模拟)
          let apiKey: string
          try {
            apiKey = getOpenRouterApiKey()
          } catch (error) {
            throw new Error('OpenRouter API key not configured: ' + (error as Error).message)
          }
          
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': 'https://tishic.netlify.app',
              'X-Title': 'Prompt Optimizer',
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                { role: 'system', content: '你是一个专业的提示词优化专家，精通六维度优化框架。' },
                { role: 'user', content: optimizationPrompt }
              ],
              max_tokens: 32768,
              temperature: 0.7,
              stream: true,
            }),
          })
          
          if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.statusText}`)
          }
          
          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          let totalContent = ''
          
          if (reader) {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              
              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') continue
                  
                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content || ''
                    if (content) {
                      totalContent += content
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ 
                          choices: [{ delta: { content } }] 
                        })}\n\n`)
                      )
                    }
                  } catch (e) {
                    console.error('Failed to parse chunk:', e)
                  }
                }
              }
            }
          }
        } else {
          // 使用 Google Gemini API
          let apiKey: string
          try {
            apiKey = getGoogleApiKey()
          } catch (error) {
            throw new Error('Google API key not configured: ' + (error as Error).message)
          }
          
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
        }
        
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