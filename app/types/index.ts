export type PromptType = 'creative' | 'analytical' | 'task' | 'generative'
export type TaskType = 'tool' | 'creative' | 'analytical' | 'generative' | 'general'
export type OptimizationMode = 'instant' | 'smart' | 'deep'

export interface OptimizationState {
  originalPrompt: string
  stage: 'input' | 'analyzing' | 'questioning' | 'optimizing' | 'complete' | 'error'
  promptType?: PromptType
  questions: Question[]
  answers: Record<string, string>
  optimizedPrompt?: string | null
  dimensions?: OptimizationDimensions
  isLoading?: boolean
  error?: {
    message: string
    code?: string
    retryable?: boolean
  }
  retryCount?: number
}

export interface OptimizationResult {
  original: string
  optimized: string
  taskType: TaskType | string
  analysis?: {
    taskType: TaskType
    confidence: number
    intent?: string
  }
  timestamp: string
}

export interface SmartSuggestions {
  avoidances: string[]
  style: string
  focus: string
  context?: string
  constraints?: string[]
  criteria?: string[]
}

export interface Question {
  id: string
  text: string
  type: 'text' | 'choice'
  options?: string[]
}

export interface OptimizationDimensions {
  antiPatterns: string[]
  sceneAtmosphere: string
  styleDepth: string
  coreFocus: string
  formalConstraints: string
  qualityStandards: string
}

// 提示词生成器相关类型
export interface PromptTemplate {
  id: string
  name: string
  icon: string
  description: string
  color: string
  gradient?: string
  questions: TemplateQuestion[]
  template: string
  isCustom?: boolean
}

export interface TemplateQuestion {
  id: string
  question: string
  placeholder: string
}

export type GeneratorStep = 'select-scene' | 'answer-questions' | 'custom' | 'show-result'

export type AppMode = 'unified' | 'generate' | 'optimize'