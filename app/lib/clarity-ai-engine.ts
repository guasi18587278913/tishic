/**
 * CLARITY AI Engine - 智能分析引擎
 * 使用AI深度分析和优化提示词
 */

import { APIClient } from './api-client'
import { ClarityAPIClient } from './clarity-api-client'
import { ClarityAnalysis, OptimizationScore, OptimizedVersion } from './clarity-optimizer'
import { TaskType } from '../types/index'

// AI分析提示词模板
const ANALYSIS_PROMPTS = {
  // 意图理解分析
  intentAnalysis: `分析以下用户输入的提示词，深入理解其真实意图和需求：

用户输入：{input}

请从以下维度进行分析：
1. 核心目标：用户想要实现什么？
2. 隐含需求：用户没有明说但可能需要的是什么？
3. 使用场景：这个提示词会在什么情况下使用？
4. 目标受众：最终产出是给谁看的？
5. 期望效果：用户期望得到什么样的结果？

请严格以JSON格式返回分析结果，确保返回的是有效的JSON对象。不要包含任何额外的文字说明。`,

  // CLARITY七维度分析
  clarityAnalysis: `基于CLARITY框架对以下提示词进行七维度分析：

原始提示词：{input}
任务类型：{taskType}

请按照以下七个维度进行分析：

1. C - Contextualize (情境化)
   - 推断的目标
   - 目标受众
   - 使用场景
   - 缺失的上下文信息

2. L - Layer (层次化)
   - 主要任务
   - 子任务列表
   - 逻辑流程
   - 任务依赖关系

3. A - Amplify (增强化)
   - 隐含的要求
   - 应该添加的质量标准
   - 必要的约束条件
   - 有用的示例

4. R - Refine (精炼化)
   - 冗余的内容
   - 矛盾之处
   - 模糊的表达
   - 改进建议

5. I - Iterate (迭代化)
   - 针对不同AI模型的优化建议
   - 可以收集反馈的点
   - 可尝试的变体方向

6. T - Tailor (定制化)
   - 适合的专业程度
   - 语气选项
   - 格式建议
   - 领域特定需求

7. Y - Yield (产出化)
   - 预期的输出形式
   - 成功标准
   - 验证方法
   - 输出格式要求

请严格以结构化的JSON格式返回分析结果，确保返回的是有效的JSON对象。不要包含任何额外的文字说明。`,

  // 优化版本生成
  optimizationGeneration: `基于以下分析结果，生成三个不同风格的优化版本：

原始提示词：{input}
CLARITY分析结果：{analysis}

请生成三个优化版本：

1. 结构化专业版
   - 重点：清晰的结构、详细的要求、专业的表达
   - 适用场景：需要严谨输出的正式场合
   - 特点：条理清晰、信息完整、易于执行

2. 简洁高效版
   - 重点：精简表达、直击要点、快速理解
   - 适用场景：需要快速获得结果
   - 特点：言简意赅、重点突出、执行高效

3. 创意引导版
   - 重点：开放式引导、激发创造力、多角度思考
   - 适用场景：需要创新和独特视角
   - 特点：富有启发性、鼓励探索、结果多样

每个版本都要：
- 解决原始提示词的问题
- 融入CLARITY分析的改进建议
- 保持用户的核心意图
- 适配目标使用场景

请严格以JSON格式返回结果，格式如下：
{
  "versions": [
    {
      "id": "version-id", 
      "title": "版本标题",
      "description": "版本描述", 
      "prompt": "优化后的提示词",
      "highlights": ["亮点1", "亮点2", "亮点3"],
      "reasoning": "优化理由"
    }
  ]
}
确保返回有效的JSON对象，不要包含任何额外的文字说明。`,

  // 评分计算
  scoreCalculation: `评估以下提示词的质量，从四个维度打分（0-100）：

提示词：{prompt}
分析结果：{analysis}

评分维度：
1. 清晰度（Clarity）：指令是否明确、表达是否清楚、有无歧义
2. 完整度（Completeness）：信息是否充分、要素是否齐全、细节是否到位
3. 可执行性（Executability）：是否易于理解和执行、步骤是否明确、可操作性如何
4. 预期效果（Effectiveness）：预计能否达到目标、输出质量的期望值

请为每个维度打分（0-100），并计算总体得分。严格按以下JSON格式返回：
{
  "clarity": 85,
  "completeness": 80,
  "executability": 90,
  "effectiveness": 85,
  "overall": 85
}
确保返回有效的JSON对象，不要包含任何额外的文字说明。`
}

export class ClarityAIEngine {
  private apiClient: APIClient | ClarityAPIClient
  
  constructor() {
    // 根据环境选择合适的API客户端
    // 在浏览器环境中使用 ClarityAPIClient（通过API路由）
    // 在服务器环境中使用 APIClient（直接调用）
    if (typeof window !== 'undefined') {
      this.apiClient = new ClarityAPIClient()
    } else {
      this.apiClient = new APIClient()
    }
  }
  
  // 智能意图分析
  async analyzeIntent(input: string): Promise<{
    coreGoal: string
    implicitNeeds: string[]
    useCase: string
    targetAudience: string
    expectedOutcome: string
  }> {
    try {
      const prompt = ANALYSIS_PROMPTS.intentAnalysis.replace('{input}', input)
      const response = await this.apiClient.generateResponse(prompt, {
        temperature: 0.3,
        maxTokens: 1000
      })
      
      // 解析AI返回的JSON
      const result = this.parseAIResponse(response)
      return {
        coreGoal: result.coreGoal || '完成指定任务',
        implicitNeeds: result.implicitNeeds || [],
        useCase: result.useCase || '一般使用',
        targetAudience: result.targetAudience || '通用受众',
        expectedOutcome: result.expectedOutcome || '符合要求的输出'
      }
    } catch (error) {
      console.error('Intent analysis error:', error)
      // 返回默认值
      return {
        coreGoal: '完成指定任务',
        implicitNeeds: [],
        useCase: '一般使用',
        targetAudience: '通用受众',
        expectedOutcome: '符合要求的输出'
      }
    }
  }
  
  // CLARITY框架深度分析
  async performClarityAnalysis(
    input: string, 
    taskType: TaskType
  ): Promise<Partial<ClarityAnalysis>> {
    try {
      const prompt = ANALYSIS_PROMPTS.clarityAnalysis
        .replace('{input}', input)
        .replace('{taskType}', taskType)
      
      const response = await this.apiClient.generateResponse(prompt, {
        temperature: 0.3,
        maxTokens: 2000
      })
      
      const result = this.parseAIResponse(response)
      
      // 转换AI响应为ClarityAnalysis格式
      return {
        context: {
          inferredGoal: result.context?.inferredGoal || '完成指定任务',
          targetAudience: result.context?.targetAudience || '通用受众',
          usageScenario: result.context?.usageScenario || '一般使用',
          missingContext: result.context?.missingContext || []
        },
        layers: {
          mainTask: result.layers?.mainTask || input,
          subTasks: result.layers?.subTasks || [],
          logicalFlow: result.layers?.logicalFlow || [],
          dependencies: result.layers?.dependencies || []
        },
        amplifications: {
          implicitRequirements: result.amplifications?.implicitRequirements || [],
          qualityStandards: result.amplifications?.qualityStandards || [],
          constraints: result.amplifications?.constraints || [],
          examples: result.amplifications?.examples || []
        },
        refinements: {
          redundancies: result.refinements?.redundancies || [],
          contradictions: result.refinements?.contradictions || [],
          ambiguities: result.refinements?.ambiguities || [],
          improvements: result.refinements?.improvements || []
        },
        iterations: {
          modelSpecific: result.iterations?.modelSpecific || {},
          feedbackPoints: result.iterations?.feedbackPoints || [],
          variations: result.iterations?.variations || []
        },
        tailoring: {
          expertise: result.tailoring?.expertise || 'intermediate',
          tone: result.tailoring?.tone || ['专业', '友好'],
          format: result.tailoring?.format || ['文本'],
          domain: result.tailoring?.domain || '通用'
        },
        yield: {
          expectedOutput: result.yield?.expectedOutput || '符合要求的内容',
          successCriteria: result.yield?.successCriteria || [],
          validationMethod: result.yield?.validationMethod || '人工审核',
          format: result.yield?.format || '文本'
        }
      }
    } catch (error) {
      console.error('CLARITY analysis error:', error)
      // 返回基础分析结果
      return {}
    }
  }
  
  // 生成优化版本
  async generateOptimizedVersions(
    input: string,
    analysis: ClarityAnalysis
  ): Promise<OptimizedVersion[]> {
    try {
      const prompt = ANALYSIS_PROMPTS.optimizationGeneration
        .replace('{input}', input)
        .replace('{analysis}', JSON.stringify(analysis, null, 2))
      
      const response = await this.apiClient.generateResponse(prompt, {
        temperature: 0.7,
        maxTokens: 3000
      })
      
      const result = this.parseAIResponse(response)
      
      // 确保返回三个版本
      const versions: OptimizedVersion[] = []
      
      if (result.versions && Array.isArray(result.versions)) {
        result.versions.forEach((v: any, index: number) => {
          versions.push({
            id: v.id || `version-${index}`,
            title: v.title || `优化版本 ${index + 1}`,
            description: v.description || '优化后的提示词',
            prompt: v.prompt || input,
            highlights: v.highlights || [],
            score: v.score || {
              clarity: 80,
              completeness: 80,
              executability: 80,
              effectiveness: 80,
              overall: 80
            },
            reasoning: v.reasoning || '基于AI分析优化'
          })
        })
      }
      
      // 如果AI没有返回足够的版本，使用备用逻辑
      while (versions.length < 3) {
        versions.push(this.createFallbackVersion(input, analysis, versions.length))
      }
      
      return versions
    } catch (error) {
      console.error('Optimization generation error:', error)
      // 返回备用版本
      return [
        this.createFallbackVersion(input, analysis, 0),
        this.createFallbackVersion(input, analysis, 1),
        this.createFallbackVersion(input, analysis, 2)
      ]
    }
  }
  
  // 计算质量评分
  async calculateScore(
    prompt: string,
    analysis: ClarityAnalysis
  ): Promise<OptimizationScore> {
    try {
      const scorePrompt = ANALYSIS_PROMPTS.scoreCalculation
        .replace('{prompt}', prompt)
        .replace('{analysis}', JSON.stringify(analysis, null, 2))
      
      const response = await this.apiClient.generateResponse(scorePrompt, {
        temperature: 0.2,
        maxTokens: 500
      })
      
      const result = this.parseAIResponse(response)
      
      return {
        clarity: Math.min(100, Math.max(0, result.clarity || 70)),
        completeness: Math.min(100, Math.max(0, result.completeness || 70)),
        executability: Math.min(100, Math.max(0, result.executability || 70)),
        effectiveness: Math.min(100, Math.max(0, result.effectiveness || 70)),
        overall: Math.min(100, Math.max(0, result.overall || 70))
      }
    } catch (error) {
      console.error('Score calculation error:', error)
      // 返回基于规则的评分
      return this.calculateRuleBasedScore(prompt, analysis)
    }
  }
  
  // 解析AI响应
  private parseAIResponse(response: string): any {
    try {
      // 首先尝试直接解析
      try {
        return JSON.parse(response);
      } catch (e) {
        // 继续尝试其他方法
      }

      // 清理响应中的控制字符
      const cleanedResponse = response
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // 移除控制字符
        .replace(/\r\n/g, '\\n') // 替换换行
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t');
      
      // 尝试找到JSON对象或数组
      const jsonMatches = cleanedResponse.match(/(\{[^{}]*\{[^{}]*\}[^{}]*\}|\{[^{}]+\}|\[[^\[\]]+\])/g);
      
      if (jsonMatches) {
        // 尝试解析每个匹配的JSON
        for (const match of jsonMatches) {
          try {
            const parsed = JSON.parse(match);
            if (typeof parsed === 'object' && parsed !== null) {
              return parsed;
            }
          } catch (e) {
            // 继续尝试下一个匹配
          }
        }
      }
      
      // 尝试提取更复杂的JSON结构
      const complexJsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (complexJsonMatch) {
        try {
          // 尝试修复常见的JSON问题
          let fixedJson = complexJsonMatch[0]
            .replace(/,\s*}/g, '}') // 移除尾部逗号
            .replace(/,\s*]/g, ']') // 移除数组尾部逗号
            .replace(/'/g, '"') // 单引号替换为双引号
            .replace(/(\w+):/g, '"$1":'); // 给键加引号
          
          return JSON.parse(fixedJson);
        } catch (e) {
          // 如果还是失败，返回默认值
        }
      }
      
      console.warn('Could not parse AI response as JSON, returning default structure');
      return {}
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      console.error('Response was:', response)
      return {}
    }
  }
  
  // 创建备用版本
  private createFallbackVersion(
    input: string,
    analysis: ClarityAnalysis,
    index: number
  ): OptimizedVersion {
    const versions = [
      {
        id: 'structured',
        title: '结构化专业版',
        description: '适合需要严谨输出的场景',
        highlights: ['明确的任务结构', '详细的要求说明', '清晰的质量标准']
      },
      {
        id: 'concise',
        title: '简洁高效版',
        description: '适合快速获得结果的场景',
        highlights: ['直击要点', '去除冗余', '保留核心需求']
      },
      {
        id: 'creative',
        title: '创意引导版',
        description: '适合需要创新思维的场景',
        highlights: ['开放式引导', '激发创造力', '鼓励多角度思考']
      }
    ]
    
    const version = versions[index]
    
    // 基于分析结果构建优化后的提示词
    let optimizedPrompt = input
    
    if (index === 0) {
      // 结构化版本
      optimizedPrompt = this.createStructuredPrompt(input, analysis)
    } else if (index === 1) {
      // 简洁版本
      optimizedPrompt = this.createConcisePrompt(input, analysis)
    } else {
      // 创意版本
      optimizedPrompt = this.createCreativePrompt(input, analysis)
    }
    
    return {
      ...version,
      prompt: optimizedPrompt,
      score: {
        clarity: 85,
        completeness: 85,
        executability: 85,
        effectiveness: 85,
        overall: 85
      },
      reasoning: '基于CLARITY框架分析优化'
    }
  }
  
  // 创建结构化提示词
  private createStructuredPrompt(input: string, analysis: ClarityAnalysis): string {
    const sections = []
    
    if (analysis.context?.inferredGoal) {
      sections.push(`【目标】\n${analysis.context.inferredGoal}`)
    }
    
    sections.push(`【任务】\n${input}`)
    
    if (analysis.amplifications?.qualityStandards && analysis.amplifications.qualityStandards.length > 0) {
      sections.push(`【质量要求】\n${analysis.amplifications.qualityStandards.map(s => `- ${s}`).join('\n')}`)
    }
    
    if (analysis.yield?.format) {
      sections.push(`【输出格式】\n${analysis.yield.format}`)
    }
    
    return sections.join('\n\n')
  }
  
  // 创建简洁提示词
  private createConcisePrompt(input: string, analysis: ClarityAnalysis): string {
    // 移除冗余，保留核心
    let concise = input
    
    // 替换模糊词汇
    const vagueWords = ['一些', '很多', '可能', '大概']
    vagueWords.forEach(word => {
      concise = concise.replace(new RegExp(word, 'g'), '')
    })
    
    // 添加核心目标
    if (analysis.context?.inferredGoal && !concise.includes(analysis.context.inferredGoal)) {
      concise = `${analysis.context.inferredGoal}：${concise}`
    }
    
    return concise.trim()
  }
  
  // 创建创意提示词
  private createCreativePrompt(input: string, analysis: ClarityAnalysis): string {
    const sections = []
    
    sections.push('让我们用创新的视角来思考：')
    sections.push(`\n核心挑战：${input}`)
    
    if (analysis.iterations?.variations && analysis.iterations.variations.length > 0) {
      sections.push('\n可以探索的方向：')
      analysis.iterations.variations.forEach(v => {
        sections.push(`- ${v}`)
      })
    }
    
    sections.push('\n期待看到独特的见解和创造性的解决方案！')
    
    return sections.join('\n')
  }
  
  // 基于规则的评分（备用）
  private calculateRuleBasedScore(
    prompt: string,
    analysis: ClarityAnalysis
  ): OptimizationScore {
    let clarity = 70
    let completeness = 70
    let executability = 70
    let effectiveness = 70
    
    // 清晰度评分
    if (prompt.length > 30) clarity += 10
    if (!analysis.refinements?.ambiguities?.length) clarity += 10
    if (!analysis.refinements?.contradictions?.length) clarity += 10
    
    // 完整度评分
    if (analysis.context?.missingContext?.length === 0) completeness += 15
    if (analysis.amplifications?.qualityStandards?.length) completeness += 15
    
    // 可执行性评分
    if (analysis.layers?.logicalFlow?.length) executability += 15
    if (analysis.yield?.format) executability += 15
    
    // 效果评分
    if (analysis.context?.inferredGoal) effectiveness += 15
    if (analysis.yield?.successCriteria?.length) effectiveness += 15
    
    const overall = Math.round((clarity + completeness + executability + effectiveness) / 4)
    
    return {
      clarity: Math.min(100, clarity),
      completeness: Math.min(100, completeness),
      executability: Math.min(100, executability),
      effectiveness: Math.min(100, effectiveness),
      overall
    }
  }
}

// 导出单例
export const clarityAIEngine = new ClarityAIEngine()