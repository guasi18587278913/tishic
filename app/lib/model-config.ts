// 模型配置 - 使用 Gemini 2.5 Flash

export const MODEL_CONFIGS = {
  // Claude Opus 4 - Anthropic 最强模型 (通过 OpenRouter)
  'claude-opus-4': {
    id: 'anthropic/claude-opus-4',
    name: 'Claude Opus 4',
    description: 'Anthropic 最强模型，理解能力卓越，特别适合复杂提示词优化',
    speed: '中速',
    cost: '$15/$75 per M tokens',
    qualityScore: 10,
    speedScore: 7,
    maxTokens: 32768,
  },
  // Gemini 2.5 Flash - Google 快速模型 (通过 OpenRouter)
  'gemini-2.5-flash': {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Google 高速模型，响应快速，成本低廉',
    speed: '极快',
    cost: '$0.075/$0.3 per M tokens',
    qualityScore: 8,
    speedScore: 10,
    maxTokens: 32768,
  },
  // Gemini 2.5 Pro - Google 最新模型 (通过 OpenRouter)
  'gemini-2.5-pro': {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Google 最新模型，中文理解能力强，性能优秀',
    speed: '快速',
    cost: '$3.5/$10.5 per M tokens',
    qualityScore: 9,
    speedScore: 9,
    maxTokens: 32768,
  },
}

// 默认使用 Claude Opus 4 以获得最佳质量
export const DEFAULT_MODEL = MODEL_CONFIGS['claude-opus-4'].id

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

// 获取模型的最大 token 数
export function getModelMaxTokens(modelId: string): number {
  const model = Object.values(MODEL_CONFIGS).find(m => m.id === modelId)
  return (model as any)?.maxTokens || 16000 // 默认 16000
}