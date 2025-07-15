import { PromptType, OptimizationDimensions } from '../types'

export const OPTIMIZATION_PROMPT = `你是专业的提示词优化专家，使用六维度框架优化提示词：

六维度框架：
1. 反模式设定 - 明确避免什么
2. 场景与氛围 - 创造具体情境  
3. 风格与深度 - 定义表达方式
4. 核心聚焦 - 收窄到具体角度
5. 形式约束 - 创造性限制
6. 质量标准 - 定义成功标准`

export function analyzePromptType(prompt: string): PromptType {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('写') || lowerPrompt.includes('创作') || lowerPrompt.includes('故事')) {
    return 'creative'
  } else if (lowerPrompt.includes('分析') || lowerPrompt.includes('比较') || lowerPrompt.includes('解释')) {
    return 'analytical'
  } else if (lowerPrompt.includes('总结') || lowerPrompt.includes('翻译') || lowerPrompt.includes('改写')) {
    return 'task'
  } else if (lowerPrompt.includes('生成') || lowerPrompt.includes('代码') || lowerPrompt.includes('创建')) {
    return 'generative'
  }
  
  return 'creative' // 默认
}

export function generateQuestions(promptType: PromptType) {
  const baseQuestions = [
    { id: '1', text: '你最想达到什么效果？', type: 'text' as const },
    { id: '2', text: '有什么特别想避免的？', type: 'text' as const },
    { id: '3', text: '有参考案例或风格偏好吗？', type: 'text' as const },
  ]

  // 根据类型可以添加特定问题
  switch (promptType) {
    case 'creative':
      baseQuestions.push({
        id: '4',
        text: '希望读者产生什么感受？',
        type: 'text'
      })
      break
    case 'analytical':
      baseQuestions.push({
        id: '4',
        text: '分析的深度要求是什么？',
        type: 'text'
      })
      break
    case 'task':
      baseQuestions.push({
        id: '4',
        text: '有特定的格式要求吗？',
        type: 'text'
      })
      break
    case 'generative':
      baseQuestions.push({
        id: '4',
        text: '技术栈或实现要求是什么？',
        type: 'text'
      })
      break
  }

  return baseQuestions
}

export function buildOptimizationPrompt(
  originalPrompt: string,
  promptType: PromptType,
  answers: Record<string, string>
): string {
  return `${OPTIMIZATION_PROMPT}

现在，请基于六维度框架优化以下提示词：

原始提示词：${originalPrompt}
类型：${promptType}

用户的补充信息：
1. 想达到的效果：${answers['1'] || '无'}
2. 想避免的：${answers['2'] || '无'}
3. 参考案例或风格：${answers['3'] || '无'}
${answers['4'] ? `4. 额外要求：${answers['4']}` : ''}

请严格按照以下格式输出（保留标记符号）：

【优化后的提示词】
（在这里输出基于六维度框架的详细、完整的优化提示词，不限字数，确保质量和细节）

【六维度设定】
请详细说明每个维度的具体设定：
- 反模式：（明确列出应避免的内容）
- 场景氛围：（描述具体的背景和情境）
- 风格深度：（定义表达方式和思维层次）
- 核心聚焦：（说明聚焦的核心点）
- 形式约束：（列出具体的限制和要求）
- 质量标准：（定义成功的标准和期望）

注意：请确保在【优化后的提示词】和【六维度设定】标记后直接输出内容，不要添加额外的说明文字。`
}