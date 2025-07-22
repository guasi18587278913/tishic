/**
 * CLARITY Framework - 智能提示词优化引擎
 * 
 * C - Contextualize (情境化)
 * L - Layer (层次化)
 * A - Amplify (增强化)
 * R - Refine (精炼化)
 * I - Iterate (迭代化)
 * T - Tailor (定制化)
 * Y - Yield (产出化)
 */

import { TaskType } from '../types/index'
import { clarityAIEngine } from './clarity-ai-engine'
import { getSimilarExamples, PromptExample } from './prompt-examples'

// 优化维度评分
export interface OptimizationScore {
  clarity: number      // 清晰度 0-100
  completeness: number // 完整度 0-100
  executability: number // 可执行性 0-100
  effectiveness: number // 预期效果 0-100
  overall: number      // 总分 0-100
}

// 优化建议
export interface OptimizationInsight {
  dimension: string    // 维度名称
  issue: string       // 发现的问题
  suggestion: string  // 改进建议
  priority: 'high' | 'medium' | 'low'
  example?: string    // 示例
}

// 优化版本
export interface OptimizedVersion {
  id: string
  title: string         // 版本标题，如"专业严谨版"、"创意灵活版"
  description: string   // 版本说明
  prompt: string       // 优化后的提示词
  highlights: string[] // 优化亮点
  score: OptimizationScore
  reasoning: string    // 优化理由
}

// CLARITY分析结果
export interface ClarityAnalysis {
  // C - 情境分析
  context: {
    inferredGoal: string      // 推断的目标
    targetAudience: string    // 目标受众
    usageScenario: string     // 使用场景
    missingContext: string[]  // 缺失的上下文
  }
  
  // L - 层次分析
  layers: {
    mainTask: string          // 主要任务
    subTasks: string[]        // 子任务
    logicalFlow: string[]     // 逻辑流程
    dependencies: string[]    // 依赖关系
  }
  
  // A - 增强点
  amplifications: {
    implicitRequirements: string[]  // 隐含要求
    qualityStandards: string[]      // 质量标准
    constraints: string[]           // 约束条件
    examples: string[]              // 示例建议
  }
  
  // R - 精炼建议
  refinements: {
    redundancies: string[]          // 冗余内容
    contradictions: string[]        // 矛盾之处
    ambiguities: string[]          // 模糊表达
    improvements: string[]          // 改进建议
  }
  
  // I - 迭代机会
  iterations: {
    modelSpecific: Record<string, string>  // 针对不同模型的优化
    feedbackPoints: string[]              // 可收集反馈的点
    variations: string[]                  // 可尝试的变体
  }
  
  // T - 定制选项
  tailoring: {
    expertise: 'beginner' | 'intermediate' | 'expert'
    tone: string[]                        // 语气选项
    format: string[]                      // 格式选项
    domain: string                        // 领域
  }
  
  // Y - 产出定义
  yield: {
    expectedOutput: string               // 预期输出
    successCriteria: string[]            // 成功标准
    validationMethod: string             // 验证方法
    format: string                       // 输出格式
  }
}

// 优化结果
export interface ClarityOptimizationResult {
  analysis: ClarityAnalysis
  insights: OptimizationInsight[]
  versions: OptimizedVersion[]
  bestPractices: string[]
  score: OptimizationScore
  similarExamples?: PromptExample[]  // 相似的优秀示例
}

// 示例库条目
export interface PromptExample {
  id: string
  category: TaskType
  original: string
  optimized: string
  score: OptimizationScore
  tags: string[]
  useCase: string
  effectiveness: number  // 实际效果评分
}

// CLARITY优化器类
export class ClarityOptimizer {
  private exampleLibrary: PromptExample[] = []
  
  constructor() {
    this.initializeExampleLibrary()
  }
  
  // 主优化方法
  async optimize(input: string, options?: {
    taskType?: TaskType
    targetModel?: string
    expertise?: 'beginner' | 'intermediate' | 'expert'
    useAI?: boolean  // 是否使用AI分析
  }): Promise<ClarityOptimizationResult> {
    const useAI = options?.useAI !== false // 默认使用AI
    
    try {
      // 1. 分析原始提示词
      let analysis: ClarityAnalysis
      if (useAI) {
        // 使用AI深度分析
        const aiAnalysis = await clarityAIEngine.performClarityAnalysis(
          input, 
          options?.taskType || 'general'
        )
        // 合并AI分析和规则分析
        const ruleAnalysis = await this.analyzePrompt(input, options)
        analysis = { ...ruleAnalysis, ...aiAnalysis } as ClarityAnalysis
      } else {
        // 仅使用规则分析
        analysis = await this.analyzePrompt(input, options)
      }
      
      // 2. 生成优化洞察
      const insights = this.generateInsights(analysis)
      
      // 3. 创建多个优化版本
      let versions: OptimizedVersion[]
      if (useAI) {
        // 使用AI生成优化版本
        versions = await clarityAIEngine.generateOptimizedVersions(input, analysis)
      } else {
        // 使用规则生成优化版本
        versions = await this.createOptimizedVersions(input, analysis, insights)
      }
      
      // 4. 提取最佳实践
      const bestPractices = this.extractBestPractices(analysis, versions)
      
      // 5. 计算整体评分
      let score: OptimizationScore
      if (useAI) {
        // 使用AI评分
        score = await clarityAIEngine.calculateScore(input, analysis)
      } else {
        // 使用规则评分
        score = this.calculateOverallScore(analysis, versions)
      }
      
      // 6. 查找相似的优秀示例
      const similarExamples = getSimilarExamples(input, 3)
      
      return {
        analysis,
        insights,
        versions,
        bestPractices,
        score,
        similarExamples: similarExamples.length > 0 ? similarExamples : undefined
      }
    } catch (error) {
      console.error('Optimization error:', error)
      // 如果AI失败，回退到规则分析
      if (useAI) {
        console.log('Falling back to rule-based optimization')
        return this.optimize(input, { ...options, useAI: false })
      }
      throw error
    }
  }
  
  // 分析提示词
  private async analyzePrompt(
    input: string, 
    options?: any
  ): Promise<ClarityAnalysis> {
    // 这里应该调用AI来深度分析，现在先用规则模拟
    const analysis: ClarityAnalysis = {
      context: this.analyzeContext(input),
      layers: this.analyzeLayers(input),
      amplifications: this.identifyAmplifications(input),
      refinements: this.identifyRefinements(input),
      iterations: this.planIterations(input, options),
      tailoring: this.analyzeTailoring(input, options),
      yield: this.defineYield(input)
    }
    
    return analysis
  }
  
  // C - 分析上下文
  private analyzeContext(input: string): ClarityAnalysis['context'] {
    // 推断目标
    const goalKeywords = {
      '写': '创建内容',
      '分析': '深入理解',
      '总结': '提炼要点',
      '翻译': '语言转换',
      '生成': '创造新内容',
      '优化': '改进现有内容',
      '解释': '阐明概念'
    }
    
    let inferredGoal = '完成指定任务'
    for (const [keyword, goal] of Object.entries(goalKeywords)) {
      if (input.includes(keyword)) {
        inferredGoal = goal
        break
      }
    }
    
    // 识别缺失的上下文
    const missingContext = []
    if (!input.includes('用于') && !input.includes('目的')) {
      missingContext.push('使用目的')
    }
    if (!input.includes('风格') && !input.includes('语气')) {
      missingContext.push('期望风格')
    }
    if (input.length < 30) {
      missingContext.push('具体要求')
    }
    
    return {
      inferredGoal,
      targetAudience: '通用受众',
      usageScenario: '一般使用',
      missingContext
    }
  }
  
  // L - 分析层次
  private analyzeLayers(input: string): ClarityAnalysis['layers'] {
    // 简化实现，实际应该用NLP分析
    const sentences = input.split(/[。！？]/).filter(s => s.trim())
    
    return {
      mainTask: sentences[0] || input,
      subTasks: sentences.slice(1),
      logicalFlow: sentences,
      dependencies: []
    }
  }
  
  // A - 识别增强点
  private identifyAmplifications(input: string): ClarityAnalysis['amplifications'] {
    const implicitRequirements = []
    const qualityStandards = []
    const constraints = []
    const examples = []
    
    // 基于常见模式识别隐含要求
    if (input.includes('文章') || input.includes('内容')) {
      implicitRequirements.push('结构清晰')
      qualityStandards.push('逻辑连贯')
    }
    
    if (input.includes('分析')) {
      implicitRequirements.push('数据支撑')
      qualityStandards.push('客观准确')
    }
    
    // 建议添加示例
    if (!input.includes('例如') && !input.includes('比如')) {
      examples.push('建议提供具体示例')
    }
    
    return {
      implicitRequirements,
      qualityStandards,
      constraints,
      examples
    }
  }
  
  // R - 识别精炼点
  private identifyRefinements(input: string): ClarityAnalysis['refinements'] {
    const redundancies = []
    const contradictions = []
    const ambiguities = []
    const improvements = []
    
    // 检测模糊词汇
    const vagueWords = ['一些', '很多', '可能', '大概', '左右']
    vagueWords.forEach(word => {
      if (input.includes(word)) {
        ambiguities.push(`"${word}"是模糊表达`)
        improvements.push(`将"${word}"替换为具体数量或范围`)
      }
    })
    
    // 检测冗余
    const words = input.split(/\s+/)
    const wordCount = new Map<string, number>()
    words.forEach(word => {
      if (word.length > 2) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1)
      }
    })
    
    wordCount.forEach((count, word) => {
      if (count > 3) {
        redundancies.push(`"${word}"重复${count}次`)
      }
    })
    
    return {
      redundancies,
      contradictions,
      ambiguities,
      improvements
    }
  }
  
  // I - 规划迭代
  private planIterations(input: string, options?: any): ClarityAnalysis['iterations'] {
    const modelSpecific: Record<string, string> = {
      'gpt-4': '添加思维链提示，如"让我们一步步思考"',
      'claude': '强调准确性和深度分析',
      'gemini': '突出创意和多角度思考'
    }
    
    const feedbackPoints = [
      '输出的详细程度是否合适',
      '风格是否符合预期',
      '是否需要更多示例'
    ]
    
    const variations = [
      '更正式的版本',
      '更简洁的版本',
      '更详细的版本'
    ]
    
    return {
      modelSpecific,
      feedbackPoints,
      variations
    }
  }
  
  // T - 分析定制需求
  private analyzeTailoring(input: string, options?: any): ClarityAnalysis['tailoring'] {
    return {
      expertise: options?.expertise || 'intermediate',
      tone: ['专业', '友好', '正式'],
      format: ['段落', '列表', '表格'],
      domain: '通用'
    }
  }
  
  // Y - 定义产出
  private defineYield(input: string): ClarityAnalysis['yield'] {
    // 基于输入推断预期输出
    let expectedOutput = '符合要求的内容'
    let format = '文本'
    
    if (input.includes('代码')) {
      expectedOutput = '可运行的代码'
      format = '代码块'
    } else if (input.includes('列表')) {
      expectedOutput = '结构化列表'
      format = '列表'
    } else if (input.includes('总结')) {
      expectedOutput = '简洁的要点'
      format = '要点列表'
    }
    
    return {
      expectedOutput,
      successCriteria: ['完整性', '准确性', '实用性'],
      validationMethod: '人工审核',
      format
    }
  }
  
  // 生成优化洞察
  private generateInsights(analysis: ClarityAnalysis): OptimizationInsight[] {
    const insights: OptimizationInsight[] = []
    
    // 基于分析结果生成洞察
    if (analysis.context.missingContext.length > 0) {
      insights.push({
        dimension: '上下文',
        issue: `缺少重要信息：${analysis.context.missingContext.join('、')}`,
        suggestion: '补充使用场景和目标受众信息',
        priority: 'high'
      })
    }
    
    if (analysis.refinements.ambiguities.length > 0) {
      insights.push({
        dimension: '表达清晰度',
        issue: `存在模糊表达：${analysis.refinements.ambiguities.join('、')}`,
        suggestion: '使用具体、明确的词汇',
        priority: 'medium'
      })
    }
    
    if (analysis.amplifications.examples.length > 0) {
      insights.push({
        dimension: '示例说明',
        issue: '缺少具体示例',
        suggestion: '添加1-2个相关示例帮助理解',
        priority: 'medium',
        example: '例如：如果要求"写一篇文章"，可以说明"写一篇关于AI发展的800字科普文章"'
      })
    }
    
    return insights
  }
  
  // 创建优化版本
  private async createOptimizedVersions(
    input: string,
    analysis: ClarityAnalysis,
    insights: OptimizationInsight[]
  ): Promise<OptimizedVersion[]> {
    const versions: OptimizedVersion[] = []
    
    // 版本1：结构化专业版
    versions.push({
      id: 'structured',
      title: '结构化专业版',
      description: '适合需要严谨输出的场景',
      prompt: this.createStructuredVersion(input, analysis),
      highlights: [
        '明确的任务结构',
        '详细的要求说明',
        '清晰的质量标准'
      ],
      score: {
        clarity: 95,
        completeness: 90,
        executability: 95,
        effectiveness: 90,
        overall: 92
      },
      reasoning: '通过结构化组织，让AI准确理解需求的各个方面'
    })
    
    // 版本2：简洁高效版
    versions.push({
      id: 'concise',
      title: '简洁高效版',
      description: '适合快速获得结果的场景',
      prompt: this.createConciseVersion(input, analysis),
      highlights: [
        '直击要点',
        '去除冗余',
        '保留核心需求'
      ],
      score: {
        clarity: 90,
        completeness: 75,
        executability: 95,
        effectiveness: 85,
        overall: 86
      },
      reasoning: '精简表达，让AI快速抓住重点并给出响应'
    })
    
    // 版本3：创意引导版
    versions.push({
      id: 'creative',
      title: '创意引导版',
      description: '适合需要创新思维的场景',
      prompt: this.createCreativeVersion(input, analysis),
      highlights: [
        '开放式引导',
        '激发创造力',
        '鼓励多角度思考'
      ],
      score: {
        clarity: 85,
        completeness: 80,
        executability: 85,
        effectiveness: 88,
        overall: 84
      },
      reasoning: '通过开放式提问和创意引导，获得更有创造性的输出'
    })
    
    return versions
  }
  
  // 创建结构化版本
  private createStructuredVersion(input: string, analysis: ClarityAnalysis): string {
    const sections = []
    
    // 角色定义
    sections.push('【角色定位】\n你是一位专业的AI助手，具备深厚的专业知识和严谨的工作态度。')
    
    // 核心任务
    sections.push(`【核心任务】\n${input}`)
    
    // 具体要求
    if (analysis.amplifications.implicitRequirements.length > 0) {
      sections.push(`【具体要求】\n${analysis.amplifications.implicitRequirements.map(r => `- ${r}`).join('\n')}`)
    }
    
    // 质量标准
    if (analysis.amplifications.qualityStandards.length > 0) {
      sections.push(`【质量标准】\n${analysis.amplifications.qualityStandards.map(s => `- ${s}`).join('\n')}`)
    }
    
    // 输出格式
    sections.push(`【输出格式】\n${analysis.yield.format}`)
    
    // 注意事项
    if (analysis.refinements.improvements.length > 0) {
      sections.push(`【注意事项】\n${analysis.refinements.improvements.map(i => `- ${i}`).join('\n')}`)
    }
    
    return sections.join('\n\n')
  }
  
  // 创建简洁版本
  private createConciseVersion(input: string, analysis: ClarityAnalysis): string {
    // 提取核心要求
    let concisePrompt = input
    
    // 移除冗余
    analysis.refinements.redundancies.forEach(redundancy => {
      // 简化重复内容
      concisePrompt = concisePrompt.replace(/(.+)\1+/g, '$1')
    })
    
    // 替换模糊词汇
    const replacements: Record<string, string> = {
      '一些': '3-5个',
      '很多': '10个以上',
      '大概': '约',
      '可能': ''
    }
    
    Object.entries(replacements).forEach(([vague, specific]) => {
      concisePrompt = concisePrompt.replace(new RegExp(vague, 'g'), specific)
    })
    
    // 添加核心上下文
    if (analysis.context.inferredGoal) {
      concisePrompt = `目标：${analysis.context.inferredGoal}\n任务：${concisePrompt}`
    }
    
    return concisePrompt
  }
  
  // 创建创意版本
  private createCreativeVersion(input: string, analysis: ClarityAnalysis): string {
    const sections = []
    
    // 创意引导开场
    sections.push('让我们用创新的视角来完成这个任务：')
    
    // 核心任务（用问题形式）
    sections.push(`核心挑战：${input}`)
    
    // 思考角度
    sections.push('请从以下角度思考：\n- 有哪些非常规的解决方案？\n- 如何让结果更有创意和吸引力？\n- 是否有跨领域的灵感可以借鉴？')
    
    // 鼓励创新
    sections.push('期待看到：\n- 独特的见解\n- 创新的表达\n- 超出预期的惊喜')
    
    return sections.join('\n\n')
  }
  
  // 提取最佳实践
  private extractBestPractices(
    analysis: ClarityAnalysis, 
    versions: OptimizedVersion[]
  ): string[] {
    const practices = []
    
    // 基于分析提取通用最佳实践
    if (analysis.context.missingContext.length === 0) {
      practices.push('✅ 提供了充足的背景信息')
    }
    
    if (analysis.refinements.ambiguities.length === 0) {
      practices.push('✅ 表达清晰明确，没有歧义')
    }
    
    // 基于优化版本提取实践
    versions.forEach(version => {
      if (version.score.overall > 85) {
        practices.push(`💡 ${version.title}的优化策略效果显著`)
      }
    })
    
    // 添加具体建议
    practices.push('📌 始终明确说明预期的输出格式')
    practices.push('📌 提供1-2个示例能大幅提升理解准确度')
    practices.push('📌 分层次组织复杂需求，避免信息过载')
    
    return practices
  }
  
  // 计算总体评分
  private calculateOverallScore(
    analysis: ClarityAnalysis,
    versions: OptimizedVersion[]
  ): OptimizationScore {
    // 基于各个维度计算分数
    let clarity = 100
    let completeness = 100
    let executability = 100
    let effectiveness = 100
    
    // 扣分项
    clarity -= analysis.refinements.ambiguities.length * 5
    clarity -= analysis.refinements.contradictions.length * 10
    
    completeness -= analysis.context.missingContext.length * 10
    completeness -= analysis.amplifications.implicitRequirements.length * 5
    
    executability -= analysis.layers.dependencies.length * 5
    
    // 确保分数在合理范围
    clarity = Math.max(0, Math.min(100, clarity))
    completeness = Math.max(0, Math.min(100, completeness))
    executability = Math.max(0, Math.min(100, executability))
    effectiveness = Math.max(0, Math.min(100, effectiveness))
    
    const overall = Math.round((clarity + completeness + executability + effectiveness) / 4)
    
    return {
      clarity,
      completeness,
      executability,
      effectiveness,
      overall
    }
  }
  
  // 初始化示例库
  private initializeExampleLibrary() {
    // 这里应该从数据库或文件加载
    this.exampleLibrary = [
      {
        id: 'ex1',
        category: 'creative',
        original: '写一篇文章',
        optimized: '请撰写一篇800-1000字的科普文章，主题是"人工智能在日常生活中的应用"。文章需要：\n1. 开篇吸引读者注意\n2. 列举3-5个具体应用场景\n3. 每个场景配以生活化的例子\n4. 结尾展望未来发展\n风格要求：通俗易懂，避免专业术语',
        score: {
          clarity: 95,
          completeness: 90,
          executability: 95,
          effectiveness: 92,
          overall: 93
        },
        tags: ['写作', '科普', '结构化'],
        useCase: '内容创作',
        effectiveness: 4.5
      }
    ]
  }
  
  // 基于示例库优化
  async optimizeWithExamples(input: string): Promise<OptimizedVersion[]> {
    // 找到相似的高质量示例
    const similarExamples = this.findSimilarExamples(input)
    
    // 基于示例生成优化版本
    const versions = similarExamples.map((example, index) => ({
      id: `example-${index}`,
      title: `基于${example.useCase}最佳实践`,
      description: `参考高分示例优化`,
      prompt: this.adaptExampleToInput(example, input),
      highlights: example.tags,
      score: example.score,
      reasoning: `基于评分${example.effectiveness}/5的成功案例改编`
    }))
    
    return versions
  }
  
  // 查找相似示例
  private findSimilarExamples(input: string): PromptExample[] {
    // 简单的关键词匹配，实际应该用向量相似度
    return this.exampleLibrary.filter(example => {
      const keywords = input.toLowerCase().split(/\s+/)
      return keywords.some(keyword => 
        example.original.toLowerCase().includes(keyword) ||
        example.tags.some(tag => tag.includes(keyword))
      )
    }).slice(0, 3)
  }
  
  // 将示例适配到用户输入
  private adaptExampleToInput(example: PromptExample, input: string): string {
    // 保留示例的结构，替换具体内容
    let adapted = example.optimized
    
    // 简单的模板替换，实际应该用更智能的方法
    // 提取用户输入的关键信息
    const userKeywords = input.match(/[\u4e00-\u9fa5]+/g) || []
    
    // 替换示例中的主题词
    if (userKeywords.length > 0) {
      adapted = adapted.replace(/主题是"[^"]*"/, `主题是"${userKeywords.join('')}"`)
    }
    
    return adapted
  }
}

// 导出单例
export const clarityOptimizer = new ClarityOptimizer()