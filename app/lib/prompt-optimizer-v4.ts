// Smart Progressive Optimization System
// 基于六维度优化框架的智能提示词优化系统

import { SmartSuggestions, TaskType } from '../types/index'
import { identifyTaskType } from './prompt-optimizer-v2'

// 六维度优化框架
interface OptimizationDimensions {
  antiPatterns: string[]      // 反模式设定 - 要避免的内容
  atmosphere: string          // 场景与氛围 - 上下文环境
  styleDepth: string         // 风格与深度 - 表达方式
  coreFocus: string          // 核心聚焦 - 重点内容
  constraints: string[]      // 形式约束 - 格式要求
  criteria: string[]         // 质量标准 - 评判标准
}

// 任务类型对应的常见反模式
const TASK_ANTI_PATTERNS: Record<Exclude<TaskType, 'unknown'>, string[]> = {
  tool: ['冗长描述', '文学修辞', '主观评价', '情感表达'],
  creative: ['呆板语言', '缺乏想象', '过度理性', '单一视角'],
  analytical: ['主观臆断', '数据缺失', '逻辑跳跃', '结论草率'],
  generative: ['内容空洞', '缺乏结构', '重复啰嗦', '偏离主题'],
  general: ['模糊不清', '目标不明', '缺少细节', '指令混乱']
}

// 任务类型对应的风格建议
const TASK_STYLES: Record<Exclude<TaskType, 'unknown'>, string> = {
  tool: '简洁直接、步骤清晰、注重实效',
  creative: '生动形象、富有创意、引人入胜',
  analytical: '逻辑严密、数据支撑、客观中立',
  generative: '结构完整、内容丰富、条理清晰',
  general: '明确具体、易于理解、目标导向'
}

// 任务类型对应的重点聚焦
const TASK_FOCUS: Record<Exclude<TaskType, 'unknown'>, string> = {
  tool: '明确输入输出、操作步骤、预期结果',
  creative: '创意方向、风格定位、情感基调',
  analytical: '分析维度、数据来源、评估标准',
  generative: '内容框架、核心要点、目标受众',
  general: '具体需求、执行方式、成功标准'
}

// 分析用户输入，提取潜在问题
function analyzeUserInput(input: string): {
  hasVagueTerms: boolean
  lacksCriteria: boolean
  missingContext: boolean
  tooShort: boolean
  tooLong: boolean
  hasConflictingRequests: boolean
} {
  const vagueTerms = ['一些', '很多', '可能', '大概', '差不多', '随便', '都行', '看看']
  const hasVagueTerms = vagueTerms.some(term => input.includes(term))
  
  const lacksCriteria = !input.includes('要求') && !input.includes('需要') && 
                        !input.includes('格式') && !input.includes('标准')
  
  const missingContext = input.length < 20 || 
                        (!input.includes('用于') && !input.includes('目的') && 
                         !input.includes('场景') && !input.includes('为了'))
  
  const tooShort = input.length < 10
  const tooLong = input.length > 500
  
  // 检测冲突请求
  const conflictPatterns = [
    ['简短', '详细'],
    ['正式', '轻松'],
    ['专业', '通俗'],
    ['快速', '深入']
  ]
  const hasConflictingRequests = conflictPatterns.some(([a, b]) => 
    input.includes(a) && input.includes(b)
  )
  
  return {
    hasVagueTerms,
    lacksCriteria,
    missingContext,
    tooShort,
    tooLong,
    hasConflictingRequests
  }
}

// 生成智能建议
export async function generateSmartSuggestions(input: string): Promise<SmartSuggestions> {
  // 识别任务类型
  const { type: taskType } = identifyTaskType(input)
  
  // 分析输入问题
  const analysis = analyzeUserInput(input)
  
  // 生成反模式建议
  const avoidances: string[] = []
  
  // 基于任务类型的反模式
  avoidances.push(...TASK_ANTI_PATTERNS[taskType].slice(0, 2))
  
  // 基于输入分析的额外建议
  if (analysis.hasVagueTerms) {
    avoidances.push('模糊表达')
  }
  if (analysis.tooShort) {
    avoidances.push('信息不足')
  }
  if (analysis.hasConflictingRequests) {
    avoidances.push('自相矛盾')
  }
  
  // 生成风格建议
  const style = TASK_STYLES[taskType]
  
  // 生成聚焦重点
  const focus = TASK_FOCUS[taskType]
  
  // 生成场景建议（如果缺少上下文）
  let context: string | undefined
  if (analysis.missingContext) {
    context = generateContextSuggestion(input, taskType)
  }
  
  // 生成约束条件
  const constraints: string[] = []
  if (analysis.lacksCriteria) {
    constraints.push(...generateConstraintSuggestions(taskType))
  }
  
  // 生成质量标准
  const criteria: string[] = generateQualityCriteria(taskType)
  
  return {
    avoidances: avoidances.slice(0, 4), // 最多4个
    style,
    focus,
    context,
    constraints: constraints.length > 0 ? constraints : undefined,
    criteria: criteria.length > 0 ? criteria : undefined
  }
}

// 生成场景建议
function generateContextSuggestion(input: string, taskType: TaskType): string {
  const contextTemplates: Record<Exclude<TaskType, 'unknown'>, string> = {
    tool: '用于日常工作流程优化，提高效率',
    creative: '面向目标受众，营造特定氛围',
    analytical: '基于具体数据集，解决实际问题',
    generative: '满足特定需求，达成预期目标',
    general: '应用于具体场景，实现明确目的'
  }
  
  return contextTemplates[taskType]
}

// 生成约束建议
function generateConstraintSuggestions(taskType: TaskType): string[] {
  const constraintMap: Record<Exclude<TaskType, 'unknown'>, string[]> = {
    tool: ['输出格式规范', '步骤编号清晰'],
    creative: ['字数范围限制', '风格保持一致'],
    analytical: ['数据引用准确', '结论基于事实'],
    generative: ['段落结构清晰', '要点突出明确'],
    general: ['响应直接相关', '避免偏题跑题']
  }
  
  return constraintMap[taskType] || []
}

// 生成质量标准
function generateQualityCriteria(taskType: TaskType): string[] {
  const criteriaMap: Record<Exclude<TaskType, 'unknown'>, string[]> = {
    tool: ['可执行性强', '结果可验证'],
    creative: ['创意独特', '表达生动'],
    analytical: ['逻辑严密', '结论可靠'],
    generative: ['内容完整', '价值明确'],
    general: ['准确性高', '实用性强']
  }
  
  return criteriaMap[taskType] || []
}

// 应用智能建议生成优化后的提示词
export async function applySmartSuggestions(
  originalPrompt: string,
  suggestions: SmartSuggestions,
  taskType: TaskType
): Promise<string> {
  const sections: string[] = []
  
  // 1. 核心任务
  sections.push(`【核心任务】\n${originalPrompt}`)
  
  // 2. 具体要求
  if (suggestions.focus) {
    sections.push(`【具体要求】\n${suggestions.focus}`)
  }
  
  // 3. 风格指南
  if (suggestions.style) {
    sections.push(`【风格指南】\n${suggestions.style}`)
  }
  
  // 4. 场景说明
  if (suggestions.context) {
    sections.push(`【场景说明】\n${suggestions.context}`)
  }
  
  // 5. 约束条件
  if (suggestions.constraints && suggestions.constraints.length > 0) {
    sections.push(`【约束条件】\n${suggestions.constraints.map(c => `- ${c}`).join('\n')}`)
  }
  
  // 6. 质量标准
  if (suggestions.criteria && suggestions.criteria.length > 0) {
    sections.push(`【质量标准】\n${suggestions.criteria.map(c => `- ${c}`).join('\n')}`)
  }
  
  // 7. 注意事项
  if (suggestions.avoidances.length > 0) {
    sections.push(`【注意事项】\n请避免：${suggestions.avoidances.join('、')}`)
  }
  
  return sections.join('\n\n')
}

// 深度定制选项
export interface DeepCustomizationOptions {
  role?: string              // AI角色设定
  examples?: string[]        // 示例输出
  format?: string           // 输出格式
  tone?: string             // 语气基调
  additionalContext?: string // 额外上下文
  specialRequirements?: string[] // 特殊要求
}

// 深度定制优化
export async function deepCustomizePrompt(
  originalPrompt: string,
  suggestions: SmartSuggestions,
  customOptions: DeepCustomizationOptions,
  taskType: TaskType
): Promise<string> {
  const sections: string[] = []
  
  // 1. 角色设定（如果有）
  if (customOptions.role) {
    sections.push(`【角色设定】\n${customOptions.role}`)
  }
  
  // 2. 核心任务
  sections.push(`【核心任务】\n${originalPrompt}`)
  
  // 3. 详细要求（整合建议和自定义）
  const requirements: string[] = []
  if (suggestions.focus) requirements.push(suggestions.focus)
  if (customOptions.specialRequirements) {
    requirements.push(...customOptions.specialRequirements)
  }
  if (requirements.length > 0) {
    sections.push(`【详细要求】\n${requirements.map(r => `- ${r}`).join('\n')}`)
  }
  
  // 4. 风格与语气
  const styleElements: string[] = []
  if (suggestions.style) styleElements.push(suggestions.style)
  if (customOptions.tone) styleElements.push(`语气：${customOptions.tone}`)
  if (styleElements.length > 0) {
    sections.push(`【风格指南】\n${styleElements.join('\n')}`)
  }
  
  // 5. 上下文信息
  const contextElements: string[] = []
  if (suggestions.context) contextElements.push(suggestions.context)
  if (customOptions.additionalContext) contextElements.push(customOptions.additionalContext)
  if (contextElements.length > 0) {
    sections.push(`【背景信息】\n${contextElements.join('\n')}`)
  }
  
  // 6. 输出格式
  if (customOptions.format) {
    sections.push(`【输出格式】\n${customOptions.format}`)
  }
  
  // 7. 示例（如果有）
  if (customOptions.examples && customOptions.examples.length > 0) {
    sections.push(`【参考示例】\n${customOptions.examples.map((ex, i) => `示例${i + 1}:\n${ex}`).join('\n\n')}`)
  }
  
  // 8. 约束与标准
  const standards: string[] = []
  if (suggestions.constraints) standards.push(...suggestions.constraints)
  if (suggestions.criteria) standards.push(...suggestions.criteria)
  if (standards.length > 0) {
    sections.push(`【质量标准】\n${standards.map(s => `- ${s}`).join('\n')}`)
  }
  
  // 9. 注意事项
  if (suggestions.avoidances.length > 0) {
    sections.push(`【注意事项】\n避免：${suggestions.avoidances.join('、')}`)
  }
  
  return sections.join('\n\n')
}