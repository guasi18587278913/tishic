import { CURRENT_MODEL } from './model-config'

export async function* streamCompletion(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  model?: string
) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://prompt-optimizer.vercel.app',
      'X-Title': 'Prompt Optimizer',
    },
    body: JSON.stringify({
      model: model || CURRENT_MODEL,
      messages,
      max_tokens: 4000,
      temperature: 0.7,
      stream: true, // 启用流式响应
    }),
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    throw new Error('No response body')
  }

  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') continue
        
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            yield content
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
}