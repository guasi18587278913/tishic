// 模型配置 - 可以根据需求切换不同的模型

export const MODEL_CONFIGS = {
  // Claude 系列
  'claude-3-opus': {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus (最强质量)',
    description: '最强大的推理能力，生成质量最高',
    speed: '较慢',
    cost: '$15/$75 per M tokens',
    qualityScore: 10,
    speedScore: 3,
  },
  
  'claude-3.5-sonnet': {
    id: 'anthropic/claude-3.5-sonnet:beta',
    name: 'Claude 3.5 Sonnet (推荐)',
    description: '最新版本，质量优秀，速度适中',
    speed: '中等',
    cost: '$3/$15 per M tokens',
    qualityScore: 9,
    speedScore: 7,
  },
  
  'claude-3-haiku': {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku (快速)',
    description: '响应极快，适合简单优化',
    speed: '非常快',
    cost: '$0.25/$1.25 per M tokens',
    qualityScore: 7,
    speedScore: 10,
  },
  
  // GPT 系列
  'gpt-4-turbo': {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo (高质量)',
    description: '优秀的理解和生成能力',
    speed: '较快',
    cost: '$10/$30 per M tokens',
    qualityScore: 9,
    speedScore: 8,
  },
  
  'gpt-4o': {
    id: 'openai/gpt-4o',
    name: 'GPT-4o (性价比)',
    description: '成本效益最佳，质量良好',
    speed: '快',
    cost: '$2.5/$10 per M tokens',
    qualityScore: 8,
    speedScore: 9,
  },
  
  // 其他优秀模型
  'gemini-pro': {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5 (长文本)',
    description: '擅长处理长文本，理解深入',
    speed: '中等',
    cost: '$3.5/$10.5 per M tokens',
    qualityScore: 8,
    speedScore: 7,
  },
}

// 默认使用高质量模型，可在设置中切换
export const DEFAULT_MODEL = MODEL_CONFIGS['claude-3.5-sonnet'].id

// 用户偏好的模型（从 localStorage 读取）
export function getUserPreferredModel(): string {
  if (typeof window === 'undefined') return DEFAULT_MODEL
  
  const saved = localStorage.getItem('preferred-model')
  return saved || DEFAULT_MODEL
}

// 保存用户偏好的模型
export function saveUserPreferredModel(modelId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred-model', modelId)
  }
}

// 智能模型推荐
export function recommendModel({
  promptLength,
  complexity,
  priority = 'balanced' // 'quality' | 'speed' | 'balanced'
}: {
  promptLength: number
  complexity: 'simple' | 'medium' | 'complex'
  priority?: 'quality' | 'speed' | 'balanced'
}) {
  const models = Object.values(MODEL_CONFIGS)
  
  // 根据优先级计算得分
  const scoredModels = models.map(model => {
    let score = 0
    
    if (priority === 'quality') {
      score = model.qualityScore * 2 + model.speedScore * 0.5
    } else if (priority === 'speed') {
      score = model.speedScore * 2 + model.qualityScore * 0.5
    } else {
      score = model.qualityScore + model.speedScore
    }
    
    // 复杂度匹配调整
    if (complexity === 'simple' && model.speedScore >= 8) {
      score += 2
    } else if (complexity === 'complex' && model.qualityScore >= 9) {
      score += 2
    }
    
    return { ...model, score }
  })
  
  // 返回得分最高的模型
  return scoredModels.sort((a, b) => b.score - a.score)[0].id
}

// 获取模型信息
export function getModelInfo(modelId: string) {
  return Object.values(MODEL_CONFIGS).find(m => m.id === modelId)
}