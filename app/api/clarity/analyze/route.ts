import { NextRequest, NextResponse } from 'next/server'
import { APIClient } from '@/app/lib/api-client'

export async function POST(request: NextRequest) {
  try {
    const { prompt, options } = await request.json()
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // 使用服务器端的API密钥
    const apiClient = new APIClient(process.env.OPENROUTER_API_KEY)
    const response = await apiClient.generateResponse(prompt, options)
    
    return NextResponse.json({ response })
  } catch (error) {
    console.error('Clarity analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}