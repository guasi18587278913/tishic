/**
 * 提示词优化器 v2.0
 * 基于任务类型的智能优化系统
 */

import { PromptType } from '../types'

// 扩展任务类型定义
export type TaskType = 
  | 'tool'        // 工具类：整理、处理、转换、格式化
  | 'creative'    // 创作类：写作、故事、文案、创意
  | 'analytical'  // 分析类：研究、评估、解释、比较
  | 'generative'  // 生成类：代码、方案、设计、列表
  | 'unknown'     // 未知类型

// 任务意图
export type TaskIntent = 
  | 'create'      // 创建新的提示词
  | 'optimize'    // 优化现有提示词
  | 'understand'  // 理解如何写提示词

// 优化维度接口
export interface OptimizationDimensions {
  taskDescription: string      // 任务描述
  antiPatterns: string[]       // 反模式（要避免的）
  successCriteria: string[]    // 成功标准
  constraints: string[]        // 约束条件
  specificDimensions?: any     // 特定类型的维度
}

// 工具类特定维度
export interface ToolDimensions {
  inputFormat: string         // 输入格式
  processingSteps: string[]   // 处理步骤
  outputFormat: string        // 输出格式
  efficiencyReqs: string[]    // 效率要求
}

// 创作类特定维度
export interface CreativeDimensions {
  sceneAtmosphere: string     // 场景氛围
  styleDepth: string          // 风格深度
  coreFocus: string           // 核心聚焦
  formalConstraints: string[] // 形式约束
}

// 分析类特定维度
export interface AnalyticalDimensions {
  analysisFramework: string   // 分析框架
  logicFlow: string           // 论证逻辑
  depthRequirement: string    // 深度要求
  conclusionStyle: string     // 结论导向
}

// 生成类特定维度
export interface GenerativeDimensions {
  techSpecs: string[]         // 技术规范
  qualityStandards: string[]  // 质量标准
  maintainability: string[]   // 可维护性
  bestPractices: string[]     // 最佳实践
}

/**
 * 智能任务类型识别
 */
export function identifyTaskType(input: string): {
  type: TaskType
  intent: TaskIntent
  confidence: number
} {
  const lowerInput = input.toLowerCase()
  
  // 意图识别
  let intent: TaskIntent = 'create'
  if (lowerInput.includes('优化') || lowerInput.includes('改进') || 
      lowerInput.includes('提升') || lowerInput.includes('改善')) {
    intent = 'optimize'
  } else if (lowerInput.includes('如何写') || lowerInput.includes('怎么写') ||
             lowerInput.includes('教我') || lowerInput.includes('指导')) {
    intent = 'understand'
  }
  
  // 任务类型识别（使用权重系统）
  const typeScores: Record<TaskType, number> = {
    tool: 0,
    creative: 0,
    analytical: 0,
    generative: 0,
    unknown: 0
  }
  
  // 工具类关键词
  const toolKeywords = [
    '整理', '组织', '处理', '转换', '格式化', '提取', '汇总', '归纳',
    '周报', '日报', '月报', '报告', '清单', '列表', '总结', '摘要'
  ]
  
  // 创作类关键词
  const creativeKeywords = [
    '写', '创作', '创造', '故事', '小说', '文章', '文案', '剧本',
    '诗', '散文', '对话', '场景', '人物', '情节', '叙事'
  ]
  
  // 分析类关键词
  const analyticalKeywords = [
    '分析', '评估', '比较', '解释', '研究', '论证', '推理', '判断',
    '原因', '影响', '趋势', '模式', '关系', '差异', '相似'
  ]
  
  // 生成类关键词
  const generativeKeywords = [
    '生成', '创建', '代码', '程序', '方案', '计划', '设计', '架构',
    '模型', '算法', '实现', '开发', '构建', '配置', '脚本'
  ]
  
  // 计算各类型得分
  toolKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword)) typeScores.tool += 1
  })
  
  creativeKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword)) {
      // 特殊处理：如果是"写周报"之类的，应该归为工具类
      if (keyword === '写' && (lowerInput.includes('周报') || 
          lowerInput.includes('日报') || lowerInput.includes('报告'))) {
        typeScores.tool += 2  // 加权
      } else {
        typeScores.creative += 1
      }
    }
  })
  
  analyticalKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword)) typeScores.analytical += 1
  })
  
  generativeKeywords.forEach(keyword => {
    if (lowerInput.includes(keyword)) typeScores.generative += 1
  })
  
  // 找出最高分的类型
  let maxScore = 0
  let identifiedType: TaskType = 'unknown'
  
  Object.entries(typeScores).forEach(([type, score]) => {
    if (score > maxScore && type !== 'unknown') {
      maxScore = score
      identifiedType = type as TaskType
    }
  })
  
  // 计算置信度
  const totalScore = Object.values(typeScores).reduce((a, b) => a + b, 0)
  const confidence = totalScore > 0 ? maxScore / totalScore : 0
  
  return {
    type: identifiedType,
    intent,
    confidence
  }
}

/**
 * 获取通用优化原则
 */
export function getCommonOptimizationPrinciples(
  type: TaskType,
  originalPrompt: string
): OptimizationDimensions {
  const base: OptimizationDimensions = {
    taskDescription: '',
    antiPatterns: [],
    successCriteria: [],
    constraints: []
  }
  
  // 根据类型设置通用反模式
  switch (type) {
    case 'tool':
      base.antiPatterns = [
        '避免模糊的处理说明',
        '避免缺少输入输出格式定义',
        '避免忽略边界情况处理',
        '避免过度复杂的流程'
      ]
      base.successCriteria = [
        '输出格式规范统一',
        '信息完整无遗漏',
        '逻辑清晰易理解',
        '可直接使用不需二次加工'
      ]
      break
      
    case 'creative':
      base.antiPatterns = [
        '避免陈词滥调和老套表达',
        '避免平铺直叙缺乏张力',
        '避免人物扁平情节单薄',
        '避免主题不明立意模糊'
      ]
      base.successCriteria = [
        '开头吸引读者注意',
        '情节发展合理有趣',
        '人物形象立体鲜明',
        '结尾令人印象深刻'
      ]
      break
      
    case 'analytical':
      base.antiPatterns = [
        '避免分析表面化',
        '避免逻辑跳跃断层',
        '避免主观臆断无据',
        '避免结论草率武断'
      ]
      base.successCriteria = [
        '分析框架清晰完整',
        '论据充分可信',
        '逻辑推理严密',
        '结论有说服力'
      ]
      break
      
    case 'generative':
      base.antiPatterns = [
        '避免过度复杂难以理解',
        '避免缺少注释和文档',
        '避免违反最佳实践',
        '避免性能低效'
      ]
      base.successCriteria = [
        '代码结构清晰',
        '注释完善易懂',
        '遵循设计模式',
        '性能优良可扩展'
      ]
      break
  }
  
  return base
}

/**
 * 获取特定类型的优化维度
 */
export function getTypeSpecificDimensions(
  type: TaskType,
  originalPrompt: string
): any {
  switch (type) {
    case 'tool':
      return {
        inputFormat: '明确输入数据的格式和来源',
        processingSteps: [
          '数据清洗和预处理',
          '信息提取和分类',
          '格式转换和组织',
          '质量检查和修正'
        ],
        outputFormat: '定义清晰的输出结构和样式',
        efficiencyReqs: [
          '处理速度要求',
          '准确度标准',
          '错误处理机制'
        ]
      } as ToolDimensions
      
    case 'creative':
      return {
        sceneAtmosphere: '营造独特的场景氛围',
        styleDepth: '确定表达风格和思想深度',
        coreFocus: '聚焦核心冲突或主题',
        formalConstraints: [
          '篇幅和结构要求',
          '文体和语言风格',
          '目标读者定位'
        ]
      } as CreativeDimensions
      
    case 'analytical':
      return {
        analysisFramework: '选择合适的分析框架',
        logicFlow: '设计清晰的论证路径',
        depthRequirement: '确定分析深度层次',
        conclusionStyle: '定义结论呈现方式'
      } as AnalyticalDimensions
      
    case 'generative':
      return {
        techSpecs: [
          '技术栈要求',
          '兼容性标准',
          '性能指标'
        ],
        qualityStandards: [
          '代码规范',
          '测试覆盖',
          '文档要求'
        ],
        maintainability: [
          '模块化设计',
          '接口定义',
          '扩展性考虑'
        ],
        bestPractices: [
          '设计模式应用',
          '安全性考虑',
          '错误处理'
        ]
      } as GenerativeDimensions
      
    default:
      return {}
  }
}

/**
 * 生成优化示例
 */
export function generateOptimizationExample(type: TaskType): {
  original: string
  optimized: string
  explanation: string
} {
  const examples: Record<TaskType, any> = {
    tool: {
      original: '帮我整理周报',
      optimized: `请将以下工作记录整理成结构化周报：

输入格式：工作日志、会议记录、项目进展的流水账
输出格式：
# 本周工作总结（2024年第X周）
## 一、已完成事项
- 【项目名称】具体成果（量化指标）
- 按重要性排序，突出关键成就

## 二、进行中事项
- 【项目名称】当前进度（完成百分比）
- 说明预计完成时间和依赖项

## 三、下周计划
- 【优先级】具体任务 - 预期产出
- 标注关键里程碑和风险点

## 四、问题与需求
- 遇到的阻碍和需要的支持
- 决策事项和风险提醒

要求：
1. 合并重复内容，去除冗余信息
2. 使用专业术语，数据支撑结论
3. 突出业务价值和贡献
4. 总字数控制在500-800字`,
      explanation: '明确了输入输出格式，提供了清晰的结构模板，设定了具体的处理要求'
    },
    
    creative: {
      original: '写一个关于友谊的故事',
      optimized: `创作一个关于友谊考验的短篇故事：

核心设定：
- 主题：真正的友谊经得起时间和利益的考验
- 背景：两个从小一起长大的朋友，一个意外获得巨额遗产
- 冲突：金钱带来的价值观分歧和信任危机
- 基调：温暖中带着现实的思考

写作要求：
1. 开篇场景：用一个日常细节展现两人过去的深厚友谊
2. 冲突展开：通过具体事件（而非说教）展现分歧
3. 人物刻画：两个主角都有合理动机，避免非黑即白
4. 结尾处理：开放但不悬浮，引发思考但不说教

技术要求：
- 2000-3000字的篇幅
- 采用双线叙事：现在的冲突与过去的美好交织
- 对话推动情节，展现人物性格
- 环境描写服务于情绪氛围

避免：套路化的"患难见真情"、说教式的友谊定义、理想化的完美结局`,
      explanation: '提供了明确的创作框架，包括主题、冲突、技术要求，同时保留创作空间'
    },
    
    analytical: {
      original: '分析社交媒体的影响',
      optimized: `对社交媒体对青少年心理健康影响进行深度分析：

分析框架：
1. 现象描述：社交媒体使用现状和趋势（数据支撑）
2. 多维度影响分析：
   - 正面影响：社交连接、信息获取、自我表达
   - 负面影响：焦虑抑郁、注意力分散、网络欺凌
   - 中性影响：行为模式改变、价值观塑造

3. 因果机制探讨：
   - 心理学视角：社交比较理论、强化机制
   - 社会学视角：群体压力、身份认同
   - 神经科学视角：多巴胺回路、注意力经济

4. 案例对比：
   - 不同国家的管控政策及效果
   - 不同平台的设计理念差异

5. 结论与建议：
   - 基于证据的平衡观点
   - 可操作的改进建议

要求：
- 引用权威研究和最新数据
- 避免一边倒的批判或赞美
- 区分相关性和因果性
- 提供具体可行的建议`,
      explanation: '建立了清晰的分析框架，要求多角度论证，强调证据支撑和平衡观点'
    },
    
    generative: {
      original: '生成一个登录功能',
      optimized: `实现一个安全的用户登录功能模块：

技术要求：
- 语言：Python/TypeScript（根据项目选择）
- 框架：FastAPI/Express + JWT
- 数据库：PostgreSQL/MongoDB
- 安全标准：OWASP认证最佳实践

功能规格：
1. 用户输入验证
   - 邮箱格式校验
   - 密码强度检查（最少8位，包含大小写和数字）
   - 防SQL注入和XSS攻击

2. 认证流程
   - 密码加密存储（bcrypt，成本因子12）
   - JWT令牌生成（有效期可配置）
   - 刷新令牌机制

3. 安全特性
   - 登录失败次数限制（5次后锁定15分钟）
   - 异常登录检测（IP、设备变化）
   - 双因素认证支持（可选）

4. API设计
   - POST /auth/login
   - POST /auth/logout  
   - POST /auth/refresh
   - GET /auth/verify

输出要求：
- 完整的代码实现
- 单元测试覆盖率>80%
- API文档（OpenAPI规范）
- 部署配置文件
- 安全最佳实践说明`,
      explanation: '详细定义了技术栈、功能规格、安全要求和交付标准，确保生成高质量代码'
    },
    
    unknown: {
      original: '帮我做个东西',
      optimized: '请具体说明您需要什么帮助，例如：\n- 创作类：写文章、故事、文案\n- 工具类：整理信息、数据处理\n- 分析类：研究问题、对比方案\n- 生成类：编写代码、设计方案',
      explanation: '引导用户提供更具体的需求'
    }
  }
  
  return examples[type] || examples.unknown
}

/**
 * 构建最终的优化提示词
 */
export function buildOptimizedPrompt(
  originalPrompt: string,
  taskType: TaskType,
  intent: TaskIntent
): string {
  // 获取优化维度
  const commonDimensions = getCommonOptimizationPrinciples(taskType, originalPrompt)
  const specificDimensions = getTypeSpecificDimensions(taskType, originalPrompt)
  const example = generateOptimizationExample(taskType)
  
  // 构建优化模板
  const optimizationTemplate = `
# 智能提示词优化

## 原始输入
"${originalPrompt}"

## 任务分析
- 识别类型：${taskType === 'tool' ? '工具类' : 
              taskType === 'creative' ? '创作类' :
              taskType === 'analytical' ? '分析类' :
              taskType === 'generative' ? '生成类' : '通用类'}
- 用户意图：${intent === 'create' ? '创建新提示词' :
              intent === 'optimize' ? '优化现有提示词' : '学习如何写提示词'}

## 优化方向

### 1. 核心任务（明确要做什么）
基于您的需求，核心任务应该是：${generateTaskDescription(originalPrompt, taskType)}

### 2. 反模式（避免什么）
${commonDimensions.antiPatterns.map(ap => `- ${ap}`).join('\n')}

### 3. 成功标准（什么是好的输出）
${commonDimensions.successCriteria.map(sc => `- ${sc}`).join('\n')}

### 4. 特定优化维度
${formatSpecificDimensions(specificDimensions, taskType)}

## 优化示例

### 优化前：
${example.original}

### 优化后：
${example.optimized}

### 优化要点：
${example.explanation}

## 您的优化建议

基于以上分析，建议将您的提示词优化为：

${generateOptimizedVersion(originalPrompt, taskType, commonDimensions, specificDimensions)}
`

  return optimizationTemplate
}

/**
 * 生成任务描述
 */
function generateTaskDescription(prompt: string, type: TaskType): string {
  const taskDescriptions: Record<TaskType, string> = {
    tool: '将散乱信息整理成结构化内容',
    creative: '创作符合特定要求的原创内容',
    analytical: '深入分析问题并得出有见地的结论',
    generative: '生成高质量、可维护的解决方案',
    unknown: '完成特定任务'
  }
  
  return taskDescriptions[type]
}

/**
 * 格式化特定维度
 */
function formatSpecificDimensions(dimensions: any, type: TaskType): string {
  switch (type) {
    case 'tool':
      const toolDim = dimensions as ToolDimensions
      return `
#### 输入输出规范
- 输入格式：${toolDim.inputFormat}
- 输出格式：${toolDim.outputFormat}

#### 处理流程
${toolDim.processingSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

#### 效率要求
${toolDim.efficiencyReqs.map(req => `- ${req}`).join('\n')}`
      
    case 'creative':
      const creativeDim = dimensions as CreativeDimensions
      return `
#### 创作要素
- 场景氛围：${creativeDim.sceneAtmosphere}
- 风格深度：${creativeDim.styleDepth}
- 核心聚焦：${creativeDim.coreFocus}

#### 形式约束
${creativeDim.formalConstraints.map(con => `- ${con}`).join('\n')}`
      
    case 'analytical':
      const analyticalDim = dimensions as AnalyticalDimensions
      return `
#### 分析要素
- 分析框架：${analyticalDim.analysisFramework}
- 论证逻辑：${analyticalDim.logicFlow}
- 深度要求：${analyticalDim.depthRequirement}
- 结论风格：${analyticalDim.conclusionStyle}`
      
    case 'generative':
      const generativeDim = dimensions as GenerativeDimensions
      return `
#### 技术规范
${generativeDim.techSpecs.map(spec => `- ${spec}`).join('\n')}

#### 质量标准
${generativeDim.qualityStandards.map(std => `- ${std}`).join('\n')}

#### 可维护性
${generativeDim.maintainability.map(m => `- ${m}`).join('\n')}

#### 最佳实践
${generativeDim.bestPractices.map(bp => `- ${bp}`).join('\n')}`
      
    default:
      return '请提供更具体的需求信息'
  }
}

/**
 * 生成优化后的版本
 */
function generateOptimizedVersion(
  originalPrompt: string,
  type: TaskType,
  commonDimensions: OptimizationDimensions,
  specificDimensions: any
): string {
  // 这里应该调用AI来生成，但为了演示，我们提供一个模板化的方法
  const templates: Record<TaskType, (prompt: string) => string> = {
    tool: (prompt) => {
      if (prompt.includes('周报')) {
        return `请将以下工作记录整理成结构化周报：

输入：工作日志、会议记录、项目进展等原始记录
处理要求：
1. 提取本周完成的关键工作项，按项目分类
2. 量化工作成果，使用数据支撑
3. 识别进行中事项的完成度和阻碍
4. 总结经验教训和改进点
5. 规划下周重点工作和目标

输出格式：
# 周工作总结（日期范围）
## 本周完成
- 【项目A】完成XXX，提升效率XX%
## 进行中
- 【项目B】进度70%，预计下周三完成
## 下周计划
- 【高优先级】具体任务和预期成果
## 问题与风险
- 需要协调的资源或待决策事项

要求：500-800字，重点突出，数据说话`
      }
      return '请根据具体需求定制处理流程'
    },
    
    creative: (prompt) => `请创作符合以下要求的内容：\n主题：${prompt}\n[具体创作要求]`,
    
    analytical: (prompt) => `请对以下问题进行深入分析：\n问题：${prompt}\n[分析框架和要求]`,
    
    generative: (prompt) => `请生成以下解决方案：\n需求：${prompt}\n[技术规范和质量要求]`,
    
    unknown: (prompt) => `请具体说明您的需求：${prompt}`
  }
  
  const generator = templates[type] || templates.unknown
  return generator(originalPrompt)
}

/**
 * 主优化函数
 */
export async function optimizePromptV2(
  userInput: string,
  options?: {
    interactiveMode?: boolean
    userAnswers?: Record<string, string>
  }
): Promise<{
  optimizedPrompt: string
  analysis: {
    taskType: TaskType
    intent: TaskIntent
    confidence: number
  }
  suggestions: string[]
}> {
  // 1. 识别任务类型和意图
  const analysis = identifyTaskType(userInput)
  
  // 2. 生成优化后的提示词
  const optimizedPrompt = buildOptimizedPrompt(
    userInput,
    analysis.type,
    analysis.intent
  )
  
  // 3. 生成改进建议
  const suggestions = generateSuggestions(analysis.type, analysis.intent)
  
  return {
    optimizedPrompt,
    analysis,
    suggestions
  }
}

/**
 * 生成改进建议
 */
function generateSuggestions(type: TaskType, intent: TaskIntent): string[] {
  const suggestions: string[] = []
  
  if (intent === 'create') {
    suggestions.push('尝试提供更多上下文信息，如使用场景、目标用户等')
  }
  
  switch (type) {
    case 'tool':
      suggestions.push(
        '明确输入数据的来源和格式',
        '详细描述期望的输出样式',
        '考虑异常情况的处理方式'
      )
      break
    case 'creative':
      suggestions.push(
        '设定明确的创作风格和基调',
        '提供人物或场景的具体细节',
        '说明目标读者群体'
      )
      break
    case 'analytical':
      suggestions.push(
        '指定分析的角度和深度',
        '说明需要的数据支撑类型',
        '明确结论的应用场景'
      )
      break
    case 'generative':
      suggestions.push(
        '详细说明技术栈和约束',
        '提供质量和性能要求',
        '考虑长期维护需求'
      )
      break
  }
  
  return suggestions
}

// 导出交互式问题生成器
export function generateInteractiveQuestions(
  taskType: TaskType
): Array<{ id: string; question: string; placeholder: string }> {
  const questionSets: Record<TaskType, Array<{ id: string; question: string; placeholder: string }>> = {
    tool: [
      {
        id: 'input_type',
        question: '输入数据是什么格式？',
        placeholder: '例如：流水账文本、语音记录、Excel表格'
      },
      {
        id: 'output_format',
        question: '期望的输出格式是什么？',
        placeholder: '例如：结构化报告、表格、清单'
      },
      {
        id: 'key_requirements',
        question: '有什么特殊要求？',
        placeholder: '例如：需要数据统计、要突出重点、限制字数'
      }
    ],
    creative: [
      {
        id: 'theme_mood',
        question: '作品的主题和基调是什么？',
        placeholder: '例如：温馨治愈、悬疑紧张、幽默轻松'
      },
      {
        id: 'target_audience',
        question: '目标读者是谁？',
        placeholder: '例如：青少年、职场人士、文学爱好者'
      },
      {
        id: 'style_reference',
        question: '有参考的风格或作品吗？',
        placeholder: '例如：村上春树的细腻、金庸的大气'
      }
    ],
    analytical: [
      {
        id: 'analysis_angle',
        question: '从什么角度进行分析？',
        placeholder: '例如：经济影响、社会意义、技术可行性'
      },
      {
        id: 'depth_requirement',
        question: '需要多深入的分析？',
        placeholder: '例如：概览介绍、深度研究、学术论文级别'
      },
      {
        id: 'data_support',
        question: '需要什么类型的数据支撑？',
        placeholder: '例如：统计数据、案例研究、专家观点'
      }
    ],
    generative: [
      {
        id: 'tech_stack',
        question: '使用什么技术栈？',
        placeholder: '例如：React + Node.js、Python + FastAPI'
      },
      {
        id: 'quality_standards',
        question: '质量要求是什么？',
        placeholder: '例如：需要测试、要有文档、遵循规范'
      },
      {
        id: 'constraints',
        question: '有什么限制条件？',
        placeholder: '例如：性能要求、兼容性、安全标准'
      }
    ],
    unknown: [
      {
        id: 'clarification',
        question: '能详细说明您的需求吗？',
        placeholder: '请描述您想要实现的目标'
      }
    ]
  }
  
  return questionSets[taskType] || questionSets.unknown
}