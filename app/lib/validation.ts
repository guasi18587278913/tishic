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

// XSS 防护：移除或转义危险的 HTML 标签和脚本
export function sanitizeInput(input: string): string {
  // 移除所有 script 标签及其内容
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // 移除所有 HTML 事件处理器
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '')
  
  // 移除危险的 HTML 标签
  const dangerousTags = ['iframe', 'object', 'embed', 'link', 'style', 'base', 'form', 'meta']
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>|</${tag}>`, 'gi')
    sanitized = sanitized.replace(regex, '')
  })
  
  // 移除危险的协议
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/vbscript:/gi, '')
  sanitized = sanitized.replace(/data:text\/html/gi, '')
  
  // 移除 HTML 实体中的危险内容
  sanitized = sanitized.replace(/&#x?[0-9a-fA-F]+;?/g, (match) => {
    // 保留常见的安全实体
    const safeEntities = ['&lt;', '&gt;', '&amp;', '&quot;', '&#39;']
    return safeEntities.includes(match) ? match : ''
  })
  
  return sanitized.trim()
}

// 检查敏感信息
function checkSensitiveInfo(value: string, field: string): void {
  const sensitivePatterns = [
    { pattern: /api[_-]?key/i, message: 'API密钥' },
    { pattern: /password/i, message: '密码' },
    { pattern: /secret/i, message: '密钥' },
    { pattern: /token/i, message: '令牌' },
    { pattern: /private[_-]?key/i, message: '私钥' },
    { pattern: /credit[_-]?card/i, message: '信用卡信息' },
    { pattern: /ssn/i, message: '社保号' },
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, message: '信用卡号' }
  ]
  
  for (const { pattern, message } of sensitivePatterns) {
    if (pattern.test(value)) {
      throw new ValidationException([{
        field,
        message: `${field} 中包含敏感信息：${message}`
      }])
    }
  }
}

// 检查注入攻击
function checkInjectionAttacks(value: string, field: string): void {
  // SQL 注入模式
  const sqlInjectionPatterns = [
    /union\s+select/i,
    /delete\s+from/i,
    /drop\s+(table|database)/i,
    /update\s+\w+\s+set/i,
    /insert\s+into/i,
    /exec(\s|\()/i,
    /execute(\s|\()/i
  ]
  
  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(value)) {
      throw new ValidationException([{
        field,
        message: `${field} 中包含不允许的SQL语句`
      }])
    }
  }
  
  // 命令注入模式
  const cmdInjectionPatterns = [
    /[;&|`$]/,
    /\$\(/,
    /\|\|/,
    /&&/
  ]
  
  // 只在非 Markdown 代码块中检查命令注入
  if (!value.includes('```')) {
    for (const pattern of cmdInjectionPatterns) {
      if (pattern.test(value)) {
        throw new ValidationException([{
          field,
          message: `${field} 中包含不允许的命令字符`
        }])
      }
    }
  }
}

// Validation functions
export function validateString(value: any, field: string, options?: {
  minLength?: number
  maxLength?: number
  required?: boolean
  sanitize?: boolean
}): string | undefined {
  const { minLength = 0, maxLength = 100000, required = true, sanitize = true } = options || {}
  
  if (!value && !required) {
    return undefined
  }
  
  if (!value || typeof value !== 'string') {
    throw new ValidationException([{
      field,
      message: `${field} is required and must be a string`
    }])
  }
  
  // 先进行 XSS 清理
  const cleaned = sanitize ? sanitizeInput(value) : value
  const trimmed = cleaned.trim()
  
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
  
  // 检查敏感信息和注入攻击
  if (sanitize) {
    checkSensitiveInfo(trimmed, field)
    checkInjectionAttacks(trimmed, field)
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
      // 对答案也进行清理
      const sanitized = sanitizeInput(val.trim())
      if (sanitized.length > 1000) {
        throw new ValidationException([{
          field: `answers.${key}`,
          message: `Answer for ${key} is too long (max 1000 characters)`
        }])
      }
      validated[key] = sanitized
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
    minLength: 10,
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
    minLength: 10,
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
    minLength: 10,
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