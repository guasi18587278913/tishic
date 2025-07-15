export type PromptType = 'creative' | 'analytical' | 'task' | 'generative'

export interface OptimizationState {
  originalPrompt: string
  stage: 'input' | 'analyzing' | 'questioning' | 'optimizing' | 'complete' | 'error'
  promptType?: PromptType
  questions: Question[]
  answers: Record<string, string>
  optimizedPrompt: string
  dimensions?: OptimizationDimensions
  isLoading?: boolean
  error?: {
    message: string
    code?: string
    retryable?: boolean
  }
  retryCount?: number
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