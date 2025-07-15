// 模型配置 - 可以根据需求切换不同的模型

export const MODEL_CONFIGS = {
  // Claude 4 系列 - 最新最强模型
  'claude-opus-4': {
    id: 'anthropic/claude-opus-4',
    name: 'Claude Opus 4 (最高质量)',
    description: '最新 Claude 4，最强推理能力，提示词优化效果最佳',
    speed: '中等',
    cost: '$15/$75 per M tokens',
    qualityScore: 10,
    speedScore: 5,
    maxTokens: 32000, // Claude Opus 4 支持更长的输出
  },
  
  'claude-3-sonnet': {
    id: 'anthropic/claude-3-sonnet', 
    name: 'Claude 3 Sonnet (稳定推荐)',
    description: '稳定性最佳，质量和速度平衡',
    speed: '中等',
    cost: '$3/$15 per M tokens',
    qualityScore: 9,
    speedScore: 7,
    maxTokens: 16000,
  },
  
  // 最新旗舰模型
  'claude-3.5-sonnet': {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet (最新版)',
    description: '最新版本，性能全面提升',
    speed: '快',
    cost: '$3/$15 per M tokens',
    qualityScore: 9.5,
    speedScore: 8,
    maxTokens: 16000,
  },
  
  'gpt-4o-latest': {
    id: 'openai/gpt-4o-2024-11-20',
    name: 'GPT-4o 最新版',
    description: '2024年11月版，多模态能力强',
    speed: '非常快',
    cost: '$2.5/$10 per M tokens',
    qualityScore: 9,
    speedScore: 9,
    maxTokens: 16000,
  },
  
  'o1-preview': {
    id: 'openai/o1-preview',
    name: 'OpenAI o1 (深度思考)',
    description: '深度推理，适合复杂提示词优化',
    speed: '慢',
    cost: '$15/$60 per M tokens',
    qualityScore: 10,
    speedScore: 2,
    maxTokens: 32000,
  },
  
  'o1-mini': {
    id: 'openai/o1-mini',
    name: 'OpenAI o1-mini (高性价比)',
    description: '推理能力强，成本更低',
    speed: '中等',
    cost: '$3/$12 per M tokens',
    qualityScore: 9,
    speedScore: 6,
    maxTokens: 16000,
  },
  
  
  'claude-3-haiku': {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku (极速)',
    description: '响应极快，适合快速迭代',
    speed: '极快',
    cost: '$0.25/$1.25 per M tokens',
    qualityScore: 7,
    speedScore: 10,
    maxTokens: 8000,
  },
  
  // 其他最新模型
  'gemini-2-flash': {
    id: 'google/gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (实验版)',
    description: '谷歌最新模型，速度极快',
    speed: '极快',
    cost: '$0.3/$1.2 per M tokens',
    qualityScore: 8,
    speedScore: 10,
    maxTokens: 8000,
  },
  
  'qwen-qwq': {
    id: 'qwen/qwq-32b-preview',
    name: 'Qwen QwQ-32B (推理专家)',
    description: '阿里最新推理模型，深度思考',
    speed: '中等',
    cost: '$0.8/$1.6 per M tokens',
    qualityScore: 9,
    speedScore: 5,
    maxTokens: 16000,
  },
  
  'deepseek-v3': {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek-V3 (中文优化)',
    description: '中文理解能力强，成本低',
    speed: '快',
    cost: '$0.14/$0.28 per M tokens',
    qualityScore: 8,
    speedScore: 8,
    maxTokens: 16000,
  },
}

// 默认使用 Claude Opus 4 - 最新最强的提示词优化
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