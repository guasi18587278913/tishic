import { NextRequest } from 'next/server'
import { analyzePromptType, buildOptimizationPrompt } from '@/app/lib/prompt-optimizer'
import { getUserPreferredModel } from '@/app/lib/model-config'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { originalPrompt, promptType, answers } = body

  // 构建优化提示词
  const optimizationPrompt = buildOptimizationPrompt(originalPrompt, promptType, answers)

  // 创建流式响应
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const abortController = new AbortController()
      const timeout = setTimeout(() => {
        abortController.abort()
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Request timeout' })}

`)
        )
        controller.close()
      }, 60000) // 60秒超时

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://prompt-optimizer.vercel.app',
            'X-Title': 'Prompt Optimizer',
          },
          body: JSON.stringify({
            model: body.model || getUserPreferredModel(),
            messages: [{ role: 'user', content: optimizationPrompt }],
            max_tokens: 4000,
            temperature: 0.7,
            stream: true, // 启用流式输出
          }),
          signal: abortController.signal,
        })

        clearTimeout(timeout)

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('No response body')
        }

        let buffer = ''
        let lastActivity = Date.now()
        const activityTimeout = 30000 // 30秒无活动超时

        // 活动检查器
        const activityChecker = setInterval(() => {
          if (Date.now() - lastActivity > activityTimeout) {
            abortController.abort()
            clearInterval(activityChecker)
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: 'Stream timeout - no activity' })}

`)
            )
            controller.close()
          }
        }, 5000)

        while (true) {
          try {
            const { done, value } = await reader.read()
            if (done) {
              clearInterval(activityChecker)
              break
            }
            
            lastActivity = Date.now()

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  clearInterval(activityChecker)
                  continue
                }
                
                if (data) {
                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content
                    if (content) {
                      // 发送内容片段
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                      )
                    }
                  } catch (e) {
                    console.error('Parse error:', e, 'Data:', data)
                    // 发送解析错误信息
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ warning: 'Parse error, some content may be lost' })}\n\n`)
                    )
                  }
                }
              }
            }
          } catch (readError) {
            clearInterval(activityChecker)
            throw readError
          }
        }
      } catch (error) {
        clearTimeout(timeout)
        console.error('Stream error:', error)
        
        let errorMessage = 'Unknown error'
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'Request was aborted'
          } else {
            errorMessage = error.message
          }
        }
        
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}