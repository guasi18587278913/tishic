import { PromptType } from '../types'

// Input validation utilities

export interface ValidationError {
  field: string
  message: string
}

export class ValidationException extends Error {
  public errors: ValidationError[]
  
  constructor(errors: ValidationError[]) {
    super('Validation failed')
    this.errors = errors
    this.name = 'ValidationException'
  }
}

// Validation functions
export function validateString(value: any, field: string, options?: {
  minLength?: number
  maxLength?: number
  required?: boolean
}): string | undefined {
  const { minLength = 0, maxLength = 100000, required = true } = options || {}
  
  if (!value && !required) {
    return undefined
  }
  
  if (!value || typeof value !== 'string') {
    throw new ValidationException([{
      field,
      message: `${field} is required and must be a string`
    }])
  }
  
  const trimmed = value.trim()
  
  if (trimmed.length < minLength) {
    throw new ValidationException([{
      field,
      message: `${field} must be at least ${minLength} characters long`
    }])
  }
  
  if (trimmed.length > maxLength) {
    throw new ValidationException([{
      field,
      message: `${field} must not exceed ${maxLength} characters`
    }])
  }
  
  return trimmed
}

export function validatePromptType(value: any): PromptType {
  const validTypes: PromptType[] = ['creative', 'analytical', 'task', 'generative']
  
  if (!value || !validTypes.includes(value)) {
    throw new ValidationException([{
      field: 'promptType',
      message: `promptType must be one of: ${validTypes.join(', ')}`
    }])
  }
  
  return value as PromptType
}

export function validateAnswers(value: any): Record<string, string> {
  if (!value || typeof value !== 'object') {
    return {} // Allow empty answers
  }
  
  const validated: Record<string, string> = {}
  
  for (const [key, val] of Object.entries(value)) {
    if (typeof val === 'string') {
      validated[key] = val.trim()
    }
  }
  
  return validated
}

// Request validation schemas
export interface AnalyzeRequestBody {
  action: 'analyze'
  data: {
    prompt: string
  }
}

export interface OptimizeRequestBody {
  action: 'optimize'
  data: {
    originalPrompt: string
    promptType: PromptType
    answers: Record<string, string>
  }
}

export function validateAnalyzeRequest(body: any): AnalyzeRequestBody {
  if (body.action !== 'analyze') {
    throw new ValidationException([{
      field: 'action',
      message: 'action must be "analyze"'
    }])
  }
  
  if (!body.data || typeof body.data !== 'object') {
    throw new ValidationException([{
      field: 'data',
      message: 'data is required and must be an object'
    }])
  }
  
  const prompt = validateString(body.data.prompt, 'prompt', {
    minLength: 1,
    maxLength: 10000
  })!
  
  return {
    action: 'analyze',
    data: { prompt }
  }
}

export function validateOptimizeRequest(body: any): OptimizeRequestBody {
  if (body.action !== 'optimize') {
    throw new ValidationException([{
      field: 'action',
      message: 'action must be "optimize"'
    }])
  }
  
  if (!body.data || typeof body.data !== 'object') {
    throw new ValidationException([{
      field: 'data',
      message: 'data is required and must be an object'
    }])
  }
  
  const originalPrompt = validateString(body.data.originalPrompt, 'originalPrompt', {
    minLength: 1,
    maxLength: 10000
  })!
  
  const promptType = validatePromptType(body.data.promptType)
  const answers = validateAnswers(body.data.answers)
  
  return {
    action: 'optimize',
    data: {
      originalPrompt,
      promptType,
      answers
    }
  }
}

export function validateStreamRequest(body: any): {
  originalPrompt: string
  promptType: PromptType
  answers: Record<string, string>
} {
  const originalPrompt = validateString(body.originalPrompt, 'originalPrompt', {
    minLength: 1,
    maxLength: 10000
  })!
  
  const promptType = validatePromptType(body.promptType)
  const answers = validateAnswers(body.answers)
  
  return {
    originalPrompt,
    promptType,
    answers
  }
}