import { PromptType, OptimizationDimensions } from '../types'

export const OPTIMIZATION_PROMPT = `下面我会给你一段用户发来的提示词，请帮助优化成更精准有效的提示词。

## 第一步：识别任务类型和真实需求

**重要**：首先准确理解用户想要什么：
1. 仔细分析用户的原始输入，理解其真实意图
2. 区分是要创建新提示词还是优化现有提示词
3. 识别具体的任务类型：

### 任务类型识别
- **工具类**：整理、处理、转换、格式化（如整理周报、处理数据）
- **创作类**：写作、创作、编故事（注意排除"写周报"等工具类）
- **分析类**：分析、比较、评估、解释
- **任务类**：总结、翻译、改写、提取
- **生成类**：生成代码、方案、列表

## 第二步：针对性优化策略

### 对于工具类任务（如整理周报）：
1. **明确输入输出**
   - 输入是什么格式（流水账、语音稿、散乱记录）
   - 输出要求什么格式（正式报告、结构化文档）
   
2. **处理流程**
   - 信息提取：从原始内容中提取关键信息
   - 分类整理：按类别组织内容
   - 格式规范：转换成目标格式
   
3. **质量要求**
   - 信息完整性
   - 逻辑清晰度
   - 专业性表达

### 对于创作类任务：
1. **创作要素**
   - 主题和立意
   - 风格和语调
   - 目标受众
   
2. **创作技巧**
   - 开头吸引力
   - 内容深度
   - 结尾升华

### 对于分析类任务：
1. **分析维度**
   - 分析角度
   - 深度要求
   - 论证方法

### 对于其他任务类型：
根据具体类型提供相应的优化策略

## 第三步：输出格式要求

1. **结构清晰**
   - 第一句话明确说明任务
   - 用数字编号列出具体步骤或要求
   - 每条要求具体可执行

2. **避免常见错误**
   - 不要把工具类任务当成创作任务
   - 不要添加与原始需求无关的要求
   - 不要使用模糊的描述词

## 示例对比

❌ 错误示例（把整理周报当成创作任务）：
"开篇用一个引人入胜的故事抓住读者注意力..."

✅ 正确示例（工具类任务）：
"请将以下工作记录整理成结构化周报：
1. 提取本周完成的主要工作项
2. 按项目分类并说明进展
3. 列出遇到的问题和解决方案
4. 总结下周计划
5. 格式要求：使用标题分级，要点用bullet points"

请直接输出优化后的提示词，不需要解释说明。`

export function analyzePromptType(prompt: string): PromptType {
  const lowerPrompt = prompt.toLowerCase()
  
  // 工具类 - 整理、组织、处理等任务
  if (lowerPrompt.includes('整理') || lowerPrompt.includes('组织') || 
      lowerPrompt.includes('处理') || lowerPrompt.includes('格式化') ||
      lowerPrompt.includes('转换') || lowerPrompt.includes('优化')) {
    // 特别处理报告类需求
    if (lowerPrompt.includes('周报') || lowerPrompt.includes('日报') || 
        lowerPrompt.includes('月报') || lowerPrompt.includes('报告')) {
      return 'task' // 归为任务类，需要特殊处理
    }
    return 'task'
  }
  
  // 创作类 - 注意排除"写周报"这种情况
  if ((lowerPrompt.includes('写') && !lowerPrompt.includes('周报') && 
       !lowerPrompt.includes('日报') && !lowerPrompt.includes('报告')) || 
      lowerPrompt.includes('创作') || lowerPrompt.includes('故事')) {
    return 'creative'
  }
  
  // 分析类
  if (lowerPrompt.includes('分析') || lowerPrompt.includes('比较') || 
      lowerPrompt.includes('解释') || lowerPrompt.includes('评估')) {
    return 'analytical'
  }
  
  // 任务类
  if (lowerPrompt.includes('总结') || lowerPrompt.includes('翻译') || 
      lowerPrompt.includes('改写') || lowerPrompt.includes('提取')) {
    return 'task'
  }
  
  // 生成类
  if (lowerPrompt.includes('生成') || lowerPrompt.includes('代码') || 
      lowerPrompt.includes('创建')) {
    return 'generative'
  }
  
  return 'task' // 默认改为任务类，更通用
}

export function generateQuestions(promptType: PromptType) {
  const baseQuestions = [
    { id: '1', text: '你最想达到什么效果？', type: 'text' as const },
    { id: '2', text: '有什么特别想避免的？', type: 'text' as const },
    { id: '3', text: '有参考案例或风格偏好吗？', type: 'text' as const },
  ]

  // 根据类型可以添加特定问题
  switch (promptType) {
    case 'creative':
      baseQuestions.push({
        id: '4',
        text: '希望读者产生什么感受？',
        type: 'text'
      })
      break
    case 'analytical':
      baseQuestions.push({
        id: '4',
        text: '分析的深度要求是什么？',
        type: 'text'
      })
      break
    case 'task':
      baseQuestions.push({
        id: '4',
        text: '有特定的格式要求吗？',
        type: 'text'
      })
      break
    case 'generative':
      baseQuestions.push({
        id: '4',
        text: '技术栈或实现要求是什么？',
        type: 'text'
      })
      break
  }

  return baseQuestions
}

export function buildOptimizationPrompt(
  originalPrompt: string,
  promptType: PromptType,
  answers: Record<string, string>
): string {
  // 任务类型映射
  const typeMapping: Record<PromptType, string> = {
    'creative': '创作类',
    'analytical': '分析类', 
    'task': '任务类/工具类',
    'generative': '生成类'
  }
  
  return `${OPTIMIZATION_PROMPT}

[用户输入的提示词]
${originalPrompt}

[系统识别的任务类型]
${typeMapping[promptType] || '通用类'}

**特别注意**：
1. 如果用户输入的是"这是一个...提示词"或"以下是...的prompt"，要先提取实际的功能需求
2. 优化后的第一句必须直接说明要做什么，不要以"作为...专家"开头
3. 不要添加与原始需求无关的内容
4. 不要混合其他任务的描述
5. 输出应该是一个完整、独立、可直接使用的提示词
6. 对于整理周报等工具类任务，重点关注输入输出格式和处理流程

## 输出示例
对于"周报生成"需求，应输出：
"请根据以下信息生成一份结构化的工作周报：
1. 提取本周完成的主要工作项
2. 按项目分类并说明进展
3. 列出遇到的问题和解决方案
4. 总结下周计划
5. 格式要求：使用标题分级，要点用bullet points"

而不是：
"作为一位深谙人性的内容创作专家，请帮我撰写一篇关于..."

请直接输出优化后的提示词，不需要其他解释或说明。`
}