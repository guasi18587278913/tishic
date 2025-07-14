import { NextRequest, NextResponse } from 'next/server'
import { analyzePromptType, generateQuestions, buildOptimizationPrompt } from '@/app/lib/prompt-optimizer'
import { claudeAPI } from '@/app/lib/claude-api'
import { openRouterAPI } from '@/app/lib/openrouter-api'
import { optimizationCache } from '@/app/lib/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'analyze':
        // 分析提示词类型并生成问题
        const promptType = analyzePromptType(data.prompt)
        const questions = generateQuestions(promptType)
        
        return NextResponse.json({
          promptType,
          questions
        })

      case 'optimize':
        // 执行优化
        const { originalPrompt, promptType: type, answers } = data
        
        // 检查缓存
        const cached = optimizationCache.get(originalPrompt, answers)
        if (cached) {
          console.log('使用缓存的优化结果')
          return NextResponse.json(cached.result)
        }
        
        // 检查是否配置了 API Key
        if (!process.env.CLAUDE_API_KEY && !process.env.OPENROUTER_API_KEY) {
          return NextResponse.json({
            optimizedPrompt: generateMockOptimizedPrompt(originalPrompt),
            dimensions: {
              antiPatterns: ['避免空泛论述', '不要技术堆砌'],
              sceneAtmosphere: '具体场景设定',
              styleDepth: '独特的表达风格',
              coreFocus: '核心论点聚焦',
              formalConstraints: '结构和格式约束',
              qualityStandards: '明确的成功标准'
            }
          })
        }

        // 构建优化提示词
        const optimizationPrompt = buildOptimizationPrompt(originalPrompt, type, answers)
        let response: string

        // 优先使用 OpenRouter，其次使用 Claude API
        if (process.env.OPENROUTER_API_KEY) {
          response = await openRouterAPI.sendMessage([
            { role: 'user', content: optimizationPrompt }
          ])
        } else {
          response = await claudeAPI.sendMessage([
            { role: 'user', content: optimizationPrompt }
          ])
        }

        // 解析响应
        const result = {
          optimizedPrompt: extractOptimizedPrompt(response),
          dimensions: extractDimensions(response)
        }
        
        // 保存到缓存
        optimizationCache.set(originalPrompt, type, answers, result)
        
        return NextResponse.json(result)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateMockOptimizedPrompt(originalPrompt: string): string {
  return `优化后的提示词：

${originalPrompt}的深度优化版本，要求如下：

1. 避免使用空泛的表述和陈词滥调，不要简单罗列概念来显示专业性

2. 从一个具体的场景或案例切入，通过细节展现整体的变化和影响

3. 采用适合主题的独特写作风格，保持一致的语言风格和思维深度

4. 聚焦于一个核心观点或问题，深入探讨而不是泛泛而谈

5. 明确的结构要求：包含引入、主体、结论三个部分，每部分都有具体的内容要求

6. 成功标准：读者应该获得新的认知或启发，而不只是信息的堆砌`
}

function extractDimensions(response: string): any {
  // 解析响应中的六维度设定
  const dimensions: any = {
    antiPatterns: [],
    sceneAtmosphere: '',
    styleDepth: '',
    coreFocus: '',
    formalConstraints: '',
    qualityStandards: ''
  }

  // 提取六维度设定部分
  const dimensionMatch = response.match(/【六维度设定】[\s\S]*$/m)
  if (dimensionMatch) {
    const dimensionText = dimensionMatch[0]
    
    // 解析每个维度
    const patterns = {
      antiPatterns: /反模式：(.+)/,
      sceneAtmosphere: /场景氛围：(.+)/,
      styleDepth: /风格深度：(.+)/,
      coreFocus: /核心聚焦：(.+)/,
      formalConstraints: /形式约束：(.+)/,
      qualityStandards: /质量标准：(.+)/
    }

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = dimensionText.match(pattern)
      if (match) {
        if (key === 'antiPatterns') {
          dimensions[key] = [match[1].trim()]
        } else {
          dimensions[key as keyof typeof dimensions] = match[1].trim()
        }
      }
    }
  }

  return dimensions
}

function extractOptimizedPrompt(response: string): string {
  // 提取优化后的提示词
  const promptMatch = response.match(/【优化后的提示词】\n([\s\S]*?)(?=\n【六维度设定】|$)/)
  if (promptMatch) {
    return promptMatch[1].trim()
  }
  return response // 如果格式不匹配，返回整个响应
}