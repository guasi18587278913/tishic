// 智能默认答案生成器

import { PromptType } from '../types'

interface SmartDefaults {
  promptType: PromptType
  answers: Record<string, string>
}

// 根据提示词类型和内容智能生成默认答案
export function generateSmartDefaults(
  originalPrompt: string,
  promptType: PromptType
): SmartDefaults {
  const prompt = originalPrompt.toLowerCase()
  
  // 基础默认答案
  const baseAnswers: Record<string, string> = {
    '1': '', // 想达到的效果
    '2': '', // 想避免的
    '3': '', // 参考案例
  }

  // 根据提示词类型设置智能默认值
  switch (promptType) {
    case 'creative':
      baseAnswers['1'] = '内容深入浅出，有独特见解，引发读者思考'
      baseAnswers['2'] = '避免空泛论述、陈词滥调和过度修饰'
      baseAnswers['3'] = '希望风格清新自然，像与朋友对话'
      
      // 如果提到特定主题，进一步细化
      if (prompt.includes('故事')) {
        baseAnswers['1'] = '情节引人入胜，人物立体，有意外转折'
        baseAnswers['3'] = '参考欧·亨利式的结尾反转'
      } else if (prompt.includes('文章')) {
        baseAnswers['1'] = '观点新颖，论证充分，结构清晰'
      }
      break
      
    case 'analytical':
      baseAnswers['1'] = '分析全面深入，逻辑清晰，有数据支撑'
      baseAnswers['2'] = '避免主观臆断和片面分析'
      baseAnswers['3'] = '采用专业但易懂的分析框架'
      
      if (prompt.includes('数据')) {
        baseAnswers['1'] = '找出关键趋势，提供可视化建议'
        baseAnswers['3'] = '参考麦肯锡的数据分析方法'
      }
      break
      
    case 'task':
      baseAnswers['1'] = '准确高效完成任务，结果清晰明了'
      baseAnswers['2'] = '避免冗余信息和格式混乱'
      baseAnswers['3'] = '保持专业规范的输出格式'
      
      if (prompt.includes('总结')) {
        baseAnswers['1'] = '抓住核心要点，层次分明'
        baseAnswers['2'] = '避免遗漏重要信息'
      } else if (prompt.includes('翻译')) {
        baseAnswers['1'] = '准确传达原意，语言流畅自然'
        baseAnswers['2'] = '避免生硬直译'
      }
      break
      
    case 'generative':
      baseAnswers['1'] = '生成内容实用可靠，符合最佳实践'
      baseAnswers['2'] = '避免过度复杂和安全隐患'
      baseAnswers['3'] = '遵循行业标准和设计模式'
      
      if (prompt.includes('代码')) {
        baseAnswers['1'] = '代码简洁高效，注释清晰，易于维护'
        baseAnswers['2'] = '避免过度设计和性能问题'
        baseAnswers['3'] = '遵循相应语言的最佳实践'
      }
      break
  }

  // 分析提示词中的特殊要求
  if (prompt.includes('简单') || prompt.includes('简洁')) {
    baseAnswers['2'] += '，避免复杂冗长的表达'
  }
  
  if (prompt.includes('专业')) {
    baseAnswers['3'] = '保持专业严谨的风格'
  }
  
  if (prompt.includes('有趣') || prompt.includes('幽默')) {
    baseAnswers['3'] = '风格轻松幽默，增加趣味性'
  }

  return {
    promptType,
    answers: baseAnswers
  }
}

// 生成快速优化的描述
export function generateQuickOptimizationDescription(
  promptType: PromptType
): string {
  const descriptions: Record<PromptType, string> = {
    creative: '将为您的创意写作添加深度、情境和独特视角',
    analytical: '将增强分析的逻辑性、数据支撑和洞察深度',
    task: '将优化任务执行的准确性、效率和输出质量',
    generative: '将提升生成内容的实用性、规范性和可维护性'
  }
  
  return descriptions[promptType] || '将全方位优化您的提示词'
}