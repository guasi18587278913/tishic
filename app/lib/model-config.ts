// 模型配置 - 可以根据需求切换不同的模型

export const MODEL_CONFIGS = {
  // 最强大但最慢
  'claude-opus-4': {
    id: 'anthropic/claude-opus-4',
    name: 'Claude 4 Opus (最强)',
    description: '最强大的推理能力，适合复杂任务',
    speed: '慢',
    cost: '$15/$75 per M tokens',
  },
  
  // 平衡选择（推荐）
  'claude-3.7-sonnet': {
    id: 'anthropic/claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet (推荐)',
    description: '性能和速度的完美平衡',
    speed: '中等',
    cost: '$3/$15 per M tokens',
  },
  
  // 最快速度
  'claude-3.5-haiku': {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku (快速)',
    description: '响应极快，适合简单任务',
    speed: '非常快',
    cost: '$0.8/$4 per M tokens',
  },
}

// 当前使用的模型（可以在这里切换）
export const CURRENT_MODEL = MODEL_CONFIGS['claude-opus-4'].id

// 根据任务复杂度自动选择模型
export function selectModelByComplexity(promptLength: number, questionCount: number) {
  // 简单任务用快速模型
  if (promptLength < 50 && questionCount <= 3) {
    return MODEL_CONFIGS['claude-3.5-haiku'].id
  }
  
  // 中等任务用平衡模型
  if (promptLength < 200) {
    return MODEL_CONFIGS['claude-3.7-sonnet'].id
  }
  
  // 复杂任务用强大模型
  return MODEL_CONFIGS['claude-opus-4'].id
}