/**
 * V2 版本的提示词优化 API
 * 使用新的智能任务识别和分类优化系统
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  identifyTaskType, 
  buildOptimizedPrompt, 
  generateInteractiveQuestions,
  optimizePromptV2 
} from '@/app/lib/prompt-optimizer-v2'
import { 
  buildEnhancedOptimizationPrompt,
  evaluatePromptQuality,
  generateSmartTemplate
} from '@/app/lib/prompt-optimizer-v3'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { OpenRouterAPI } from '@/app/lib/openrouter-api'
import { getGoogleApiKey, getOpenRouterApiKey, getApiProvider, getModelName } from '@/app/lib/env-validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, prompt, answers } = body
    
    switch (action) {
      case 'analyze':
        // 智能任务类型识别
        const analysis = identifyTaskType(prompt)
        const questions = generateInteractiveQuestions(analysis.type)
        
        return NextResponse.json({
          analysis,
          questions,
          preview: buildOptimizedPrompt(prompt, analysis.type, analysis.intent)
        })
        
      case 'optimize':
        // 先进行任务分析
        const taskAnalysis = identifyTaskType(prompt)
        
        // 检查是否有智能模板
        const smartTemplate = generateSmartTemplate(taskAnalysis.type, prompt)
        
        // 使用 V3 增强提示
        const enhancedPrompt = buildEnhancedOptimizationPrompt(prompt)
        
        // 使用 AI 进行优化
        const provider = getApiProvider()
        let aiOptimizedPrompt: string
        
        try {
          if (provider === 'openrouter') {
            const apiKey = getOpenRouterApiKey()
            const openRouter = new OpenRouterAPI(apiKey, getModelName())
            
            const systemPrompt = `你是一个专业的提示词工程师。用户需要你帮助创建或优化"提示词"。

重要理解：
- "提示词"是给AI的指令，不是给人类的教程
- 用户需要的是可以直接复制粘贴给AI使用的完整指令
- 不是教用户"如何写"，而是直接"写出来"

要求：
1. 输出一个完整的、结构化的AI提示词
2. 包含：任务定义、输入说明、处理步骤、输出格式、质量标准
3. 可以直接复制使用，不需要用户再修改
4. 针对具体任务场景，不要太通用`
            
            aiOptimizedPrompt = await openRouter.sendMessage([
              { role: 'system', content: systemPrompt },
              { role: 'user', content: enhancedPrompt }
            ])
          } else {
            const apiKey = getGoogleApiKey()
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ 
              model: 'gemini-1.5-pro-latest',
              generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
              }
            })
            
            const result = await model.generateContent(`你是一个专业的提示词工程师。

重要理解：
- "提示词"是给AI的指令，不是给人类的教程
- 用户需要的是可以直接复制粘贴给AI使用的完整指令

${enhancedPrompt}

请生成最终优化后的提示词。直接输出，不需要解释。`)
            
            aiOptimizedPrompt = result.response.text()
          }
          
          // 清理 AI 输出
          aiOptimizedPrompt = cleanAIOutput(aiOptimizedPrompt)
          
          // 评估优化后的质量
          const qualityCheck = evaluatePromptQuality(aiOptimizedPrompt)
          
          return NextResponse.json({
            optimizedPrompt: aiOptimizedPrompt,
            analysis: taskAnalysis,
            quality: qualityCheck,
            suggestions: [
              ...qualityCheck.suggestions,
              '可以根据实际使用效果继续调整',
              '保存这个提示词以便复用'
            ],
            template: smartTemplate, // 提供模板参考
            debug: {
              enhancedPrompt: enhancedPrompt.substring(0, 500) + '...'
            }
          })
          
        } catch (error) {
          console.error('AI optimization failed:', error)
          // 如果 AI 失败，返回本地优化结果
          // 如果 AI 失败，返回智能模板
          return NextResponse.json({
            optimizedPrompt: smartTemplate,
            analysis: taskAnalysis,
            quality: evaluatePromptQuality(smartTemplate),
            suggestions: [
              '这是基于模板生成的提示词',
              '你可以根据具体需求进行调整',
              '建议添加更多具体的业务细节'
            ],
            fallback: true
          })
        }
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('V2 API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * 清理 AI 输出，去除不必要的前缀和后缀
 */
function cleanAIOutput(text: string): string {
  // 去除常见的前缀
  const prefixPatterns = [
    /^(以下是|这是|根据.*?优化后的|优化后的|最终的|基于.*?的)?提示词[:：]\s*/i,
    /^```[\s\S]*?\n/,
    /^优化版本[:：]\s*/i
  ]
  
  let cleaned = text.trim()
  for (const pattern of prefixPatterns) {
    cleaned = cleaned.replace(pattern, '')
  }
  
  // 去除结尾的 markdown 代码块标记
  cleaned = cleaned.replace(/\n```\s*$/, '')
  
  // 如果整个内容被包在引号中，去除引号
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith('「') && cleaned.endsWith('」')) ||
      (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
    cleaned = cleaned.slice(1, -1)
  }
  
  return cleaned.trim()
}

/**
 * 从本地优化结果中提取最终的提示词
 */
function extractOptimizedPrompt(fullText: string): string {
  // 查找 "您的优化建议" 或类似标记后的内容
  const markers = [
    '您的优化建议',
    '基于以上分析，建议将您的提示词优化为：',
    '优化后：',
    '## 优化后'
  ]
  
  for (const marker of markers) {
    const index = fullText.lastIndexOf(marker)
    if (index !== -1) {
      const extracted = fullText.substring(index + marker.length).trim()
      // 如果提取的内容太短，可能是错误的，继续尝试下一个标记
      if (extracted.length > 50) {
        return cleanAIOutput(extracted)
      }
    }
  }
  
  // 如果没有找到标记，尝试提取最后一个代码块
  const codeBlockMatch = fullText.match(/```[\s\S]*?```/g)
  if (codeBlockMatch && codeBlockMatch.length > 0) {
    const lastCodeBlock = codeBlockMatch[codeBlockMatch.length - 1]
    return cleanAIOutput(lastCodeBlock.replace(/```/g, '').trim())
  }
  
  // 如果都失败了，返回一个基本模板
  return '请根据您的具体需求，参考以上分析框架编写提示词。'
}