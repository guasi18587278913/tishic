import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { SmartSuggestions } from '@/app/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1'
})

const SUGGESTIONS_PROMPT = `你是一个专业的提示词优化顾问。用户给你一个原始想法或需求，你需要分析并提供优化建议。

用户输入：{input}
任务类型：{taskType}

请分析用户的需求，并生成优化建议。建议应该：
1. 识别用户真正想要达成的目标
2. 发现可能的误区或不清晰的地方
3. 提供具体的优化方向

请以JSON格式返回：
{
  "avoidances": ["避免模糊表达", "避免过于宽泛", "..."], // 2-4个要避免的问题
  "style": "专业严谨且易于理解", // 一句话描述推荐的风格
  "focus": "核心是要生成清晰的周报内容结构", // 一句话描述核心聚焦点
  "context": "用于企业内部汇报，需要突出成果和价值" // 可选，场景描述
}

注意：
- avoidances数组应该具体指出用户原始输入中的问题
- style和focus要根据任务类型给出针对性建议
- 所有建议都要简洁明了，用户友好`

export async function POST(request: NextRequest) {
  try {
    const { prompt, taskType } = await request.json()

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const suggestionsPrompt = SUGGESTIONS_PROMPT
      .replace('{input}', prompt)
      .replace('{taskType}', getTaskTypeLabel(taskType))

    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的提示词优化顾问，帮助用户改进他们的AI提示词。'
        },
        {
          role: 'user',
          content: suggestionsPrompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const suggestions: SmartSuggestions = JSON.parse(content)

    // Validate the response structure
    if (!suggestions.avoidances || !Array.isArray(suggestions.avoidances) || 
        !suggestions.style || !suggestions.focus) {
      throw new Error('Invalid suggestions format')
    }

    return NextResponse.json(suggestions)

  } catch (error) {
    console.error('Error generating suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}

function getTaskTypeLabel(taskType: string): string {
  const labels: Record<string, string> = {
    tool: '工具类任务',
    creative: '创作类任务',
    analytical: '分析类任务',
    generative: '生成类任务',
    general: '通用任务'
  }
  return labels[taskType] || '通用任务'
}