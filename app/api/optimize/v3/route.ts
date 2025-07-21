import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ENHANCED_OPTIMIZATION_PROMPT, createOptimizationPromptWithSuggestions } from '@/app/lib/prompt-optimizer-v3'
import { SmartSuggestions } from '@/app/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1'
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, prompt, suggestions, taskType } = body

    if (action === 'optimize') {
      if (!prompt || !prompt.trim()) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
      }

      // Use suggestions if provided (deep mode), otherwise use standard v3 optimization
      const optimizationPrompt = suggestions 
        ? createOptimizationPromptWithSuggestions(prompt, suggestions as SmartSuggestions, taskType)
        : ENHANCED_OPTIMIZATION_PROMPT.replace('{userInput}', prompt)

      const response = await openai.chat.completions.create({
        model: 'anthropic/claude-opus-4-20250514',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的提示词工程师，擅长将模糊的想法转化为清晰、具体、可执行的AI指令。'
          },
          {
            role: 'user',
            content: optimizationPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const optimizedPrompt = response.choices[0]?.message?.content || prompt
      
      // Return the result in the expected format
      return NextResponse.json({
        optimizedPrompt,
        analysis: {
          type: taskType || 'general',
          confidence: 0.95,
          intent: 'optimized'
        }
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('V3 Optimization error:', error)
    return NextResponse.json(
      { error: 'Optimization failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}