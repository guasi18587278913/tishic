import { NextRequest, NextResponse } from 'next/server'
import { analyzePromptType, generateQuestions, buildOptimizationPrompt } from '@/app/lib/prompt-optimizer'
import { 
  identifyTaskType, 
  buildOptimizedPrompt, 
  generateInteractiveQuestions,
  optimizePromptV2 
} from '@/app/lib/prompt-optimizer-v2'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { OpenRouterAPI } from '@/app/lib/openrouter-api'
import { enhancedCache } from '@/app/lib/enhanced-cache'
import { validateAnalyzeRequest, validateOptimizeRequest, ValidationException } from '@/app/lib/validation'
import { getGoogleApiKey, getOpenRouterApiKey, getApiProvider, getModelName, logEnvInfo } from '@/app/lib/env-validation'

export async function POST(request: NextRequest) {
  try {
    // 检查是否是预热请求
    const isWarmupRequest = request.headers.get('X-Warmup-Request') === 'true'
    
    let body: any
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    const { action } = body
    
    // 预热请求的快速响应
    if (isWarmupRequest) {
      console.log('Processing warmup request for action:', action)
      return NextResponse.json({ 
        status: 'warmed',
        action,
        timestamp: Date.now() 
      }, {
        headers: {
          'Cache-Control': 'no-store',
          'X-Warmup-Response': 'true'
        }
      })
    }

    switch (action) {
      case 'analyze':
        // 验证请求
        const analyzeReq = validateAnalyzeRequest(body)
        
        // 使用新的智能识别系统
        const taskAnalysis = identifyTaskType(analyzeReq.data.prompt)
        const interactiveQuestions = generateInteractiveQuestions(taskAnalysis.type)
        
        // 为了兼容性，也返回旧的格式
        const promptType = analyzePromptType(analyzeReq.data.prompt)
        const questions = generateQuestions(promptType)
        
        return NextResponse.json({
          promptType,
          questions,
          // 新增的智能分析结果
          v2: {
            taskType: taskAnalysis.type,
            intent: taskAnalysis.intent,
            confidence: taskAnalysis.confidence,
            interactiveQuestions
          }
        })

      case 'optimize':
        // 验证请求
        const optimizeReq = validateOptimizeRequest(body)
        const { originalPrompt, promptType: type, answers, useV2 } = optimizeReq.data
        
        // 使用 V2 版本的优化逻辑
        if (useV2 !== false) {  // 默认使用 V2
          try {
            const v2Result = await optimizePromptV2(originalPrompt, {
              interactiveMode: false,
              userAnswers: answers
            })
            
            // 检查缓存
            const cached = enhancedCache.get(originalPrompt, answers || {})
            if (cached) {
              console.log('使用缓存的V2优化结果')
              return NextResponse.json(cached.result, {
                headers: {
                  'X-Cache': 'HIT',
                  'X-Version': 'v2',
                  'Cache-Control': 'private, max-age=3600'
                }
              })
            }
            
            // 构建响应
            const response = {
              optimizedPrompt: v2Result.optimizedPrompt,
              analysis: v2Result.analysis,
              suggestions: v2Result.suggestions,
              dimensions: {
                taskType: v2Result.analysis.taskType,
                intent: v2Result.analysis.intent,
                confidence: v2Result.analysis.confidence
              }
            }
            
            // 存入缓存
            enhancedCache.set(originalPrompt, v2Result.analysis.taskType, answers || {}, response)
            
            return NextResponse.json(response, {
              headers: {
                'X-Version': 'v2',
                'Cache-Control': 'private, max-age=3600'
              }
            })
          } catch (error) {
            console.error('V2 optimization failed, falling back to V1:', error)
            // 如果 V2 失败，继续使用 V1
          }
        }
        
        // V1 逻辑（作为后备）
        // 如果没有答案或答案为空，使用智能默认值
        let finalAnswers = answers
        if (!answers || Object.keys(answers).length === 0) {
          const { generateSmartDefaults } = await import('@/app/lib/smart-defaults')
          const smartDefaults = generateSmartDefaults(originalPrompt, type)
          finalAnswers = smartDefaults.answers
        }
        
        // 检查缓存
        const cached = enhancedCache.get(originalPrompt, finalAnswers)
        if (cached) {
          console.log('使用缓存的优化结果')
          return NextResponse.json(cached.result, {
            headers: {
              'X-Cache': 'HIT',
              'Cache-Control': 'private, max-age=3600'
            }
          })
        }
        
        // 记录环境信息（仅在开发环境）
        if (process.env.NODE_ENV === 'development') {
          logEnvInfo()
        }

        // 根据 API 提供商选择不同的处理方式
        const provider = getApiProvider()
        let text: string
        
        if (provider === 'openrouter') {
          // 使用 OpenRouter API
          let apiKey: string
          try {
            apiKey = getOpenRouterApiKey()
          } catch (error) {
            console.error('OpenRouter API Key not configured:', error)
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
          
          const openRouter = new OpenRouterAPI(apiKey, getModelName())
          const optimizationPrompt = buildOptimizationPrompt(originalPrompt, type, finalAnswers)
          
          text = await openRouter.sendMessage([
            { role: 'system', content: '你是一个专业的提示词优化专家，精通六维度优化框架。' },
            { role: 'user', content: optimizationPrompt }
          ])
        } else {
          // 使用 Google Gemini API
          let apiKey: string
          try {
            apiKey = getGoogleApiKey()
          } catch (error) {
            console.error('Google API Key not configured:', error)
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
          
          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-pro-latest',
            generationConfig: {
              maxOutputTokens: 32768,
              temperature: 0.7,
            }
          })
          
          const optimizationPrompt = buildOptimizationPrompt(originalPrompt, type, finalAnswers)
          const result = await model.generateContent(optimizationPrompt)
          const response = result.response
          text = response.text()
        }
        
        console.log('=== Gemini Response Debug ===')
        console.log('Response length:', text.length)
        console.log('Response preview (first 500 chars):')
        console.log(text.substring(0, 500))
        console.log('Response preview (last 500 chars):')
        console.log(text.substring(Math.max(0, text.length - 500)))

        // 解析响应
        const optimizationResult = {
          optimizedPrompt: extractOptimizedPrompt(text),
          dimensions: {} // 新模板不需要提取维度
        }
        
        console.log('=== Extraction Results ===')
        console.log('Optimized prompt length:', optimizationResult.optimizedPrompt.length)
        console.log('Optimized prompt preview:', optimizationResult.optimizedPrompt.substring(0, 100) + '...')
        console.log('Dimensions:', JSON.stringify(optimizationResult.dimensions, null, 2))
        
        // 验证提取结果
        if (!optimizationResult.optimizedPrompt || optimizationResult.optimizedPrompt.length < 10) {
          console.error('Warning: Extracted prompt is too short or empty!')
          // 使用整个响应作为fallback
          optimizationResult.optimizedPrompt = text
        }
        
        // 保存到缓存
        enhancedCache.set(originalPrompt, type, finalAnswers, optimizationResult)
        
        return NextResponse.json(optimizationResult, {
          headers: {
            'X-Cache': 'MISS',
            'Cache-Control': 'private, max-age=3600'
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('API error:', error)
    
    // 处理验证错误
    if (error instanceof ValidationException) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          errors: error.errors 
        },
        { status: 400 }
      )
    }
    
    // 在生产环境中隐藏详细错误信息
    const isDevelopment = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      { 
        error: 'Internal server error',
        ...(isDevelopment && { details: error instanceof Error ? error.message : 'Unknown error' })
      },
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
  console.log('=== Extracting dimensions ===')
  
  // 解析响应中的六维度设定
  const dimensions: any = {
    antiPatterns: [],
    sceneAtmosphere: '',
    styleDepth: '',
    coreFocus: '',
    formalConstraints: '',
    qualityStandards: ''
  }

  // 提取六维度设定部分 - 尝试多种格式
  const dimensionPatterns = [
    /【六维度设定】([\s\S]*?)$/m,
    /\*\*六维度设定\*\*([\s\S]*?)$/m,
    /## 六维度设定([\s\S]*?)$/m,
    /六维度设定[:：]([\s\S]*?)$/mi
  ]
  
  let dimensionText = ''
  for (const pattern of dimensionPatterns) {
    const match = response.match(pattern)
    if (match) {
      dimensionText = match[1] || match[0]
      console.log('Found dimension section with pattern:', pattern.source)
      break
    }
  }
  
  if (!dimensionText) {
    console.log('No dimension section found, using default values')
    return dimensions
  }
  
  console.log('Dimension text preview:', dimensionText.substring(0, 200))
  
  // 解析每个维度 - 支持多种格式
  const patterns = {
    antiPatterns: [
      /[-•\*]?\s*反模式[:：]\s*(.+)/,
      /[-•\*]?\s*避免[:：]\s*(.+)/,
      /[-•\*]?\s*不要[:：]\s*(.+)/
    ],
    sceneAtmosphere: [
      /[-•\*]?\s*场景氛围[:：]\s*(.+)/,
      /[-•\*]?\s*场景[:：]\s*(.+)/,
      /[-•\*]?\s*背景[:：]\s*(.+)/
    ],
    styleDepth: [
      /[-•\*]?\s*风格深度[:：]\s*(.+)/,
      /[-•\*]?\s*风格[:：]\s*(.+)/,
      /[-•\*]?\s*表达方式[:：]\s*(.+)/
    ],
    coreFocus: [
      /[-•\*]?\s*核心聚焦[:：]\s*(.+)/,
      /[-•\*]?\s*核心[:：]\s*(.+)/,
      /[-•\*]?\s*聚焦[:：]\s*(.+)/
    ],
    formalConstraints: [
      /[-•\*]?\s*形式约束[:：]\s*(.+)/,
      /[-•\*]?\s*形式[:：]\s*(.+)/,
      /[-•\*]?\s*约束[:：]\s*(.+)/
    ],
    qualityStandards: [
      /[-•\*]?\s*质量标准[:：]\s*(.+)/,
      /[-•\*]?\s*质量[:：]\s*(.+)/,
      /[-•\*]?\s*标准[:：]\s*(.+)/
    ]
  }

  for (const [key, patternList] of Object.entries(patterns)) {
    let found = false
    for (const pattern of patternList) {
      const match = dimensionText.match(pattern)
      if (match) {
        const value = match[1].trim()
        if (key === 'antiPatterns') {
          dimensions[key] = [value]
        } else {
          dimensions[key as keyof typeof dimensions] = value
        }
        console.log(`Found ${key}:`, value.substring(0, 50) + '...')
        found = true
        break
      }
    }
    if (!found) {
      console.log(`No match found for ${key}`)
    }
  }

  return dimensions
}

function extractOptimizedPrompt(response: string): string {
  console.log('=== Extracting optimized prompt ===')
  console.log('Response first 500 chars:', response.substring(0, 500))
  
  // 由于新的优化模板直接输出优化后的提示词，不需要复杂的提取逻辑
  // 直接返回整个响应内容
  const cleaned = response.trim()
  
  // 移除可能的开头和结尾标记
  const unwanted = ['优化后：', '优化后的提示词：', '优化结果：']
  let result = cleaned
  for (const prefix of unwanted) {
    if (result.startsWith(prefix)) {
      result = result.substring(prefix.length).trim()
    }
  }
  
  console.log('Extracted prompt length:', result.length)
  return result
  
  // 如果都没匹配到，尝试提取第一个段落直到遇到六维度相关内容
  const sixDimPattern = /(?:【?六维度设定】?|\*\*六维度设定\*\*|## 六维度设定)/
  const sixDimIndex = response.search(sixDimPattern)
  
  if (sixDimIndex > 0) {
    const extracted = response.substring(0, sixDimIndex).trim()
    console.log('Extracted by six-dim boundary, length:', extracted.length)
    return extracted
  }
  
  // 最后的fallback：如果响应很短，可能整个都是优化后的提示词
  if (response.length < 1000) {
    console.log('Using entire response as prompt')
    return response
  }
  
  // 否则尝试提取前半部分
  const halfLength = Math.floor(response.length / 2)
  const firstHalf = response.substring(0, halfLength)
  console.log('Using first half of response, length:', firstHalf.length)
  return firstHalf
}