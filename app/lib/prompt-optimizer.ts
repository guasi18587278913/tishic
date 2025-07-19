import { PromptType, OptimizationDimensions } from '../types'

export const OPTIMIZATION_PROMPT = `下面我会给你一段用户发来的提示词，我希望你帮忙优化，我希望可以用下面这个方法和思路来优化提示词：

## 第一步：理解核心意图

**重要**：先判断用户输入的是什么：
- 如果是对提示词的描述或介绍 → 提取其核心功能需求
- 如果已经是一个提示词 → 直接优化其结构和表达
- 如果是一个任务需求 → 转化为结构化提示词

然后识别目标类型：
- 创作类（故事、对话、文章）
- 分析类（解释、比较、评估）
- 任务类（总结、翻译、改写）
- 生成类（代码、方案、列表）

## 第二步：六维度优化框架

### 1. 反模式设定（避免什么）
识别该类任务的常见陷阱，并明确排除：
- 创作类：避免陈词滥调、过度修饰、空洞情节
- 分析类：避免表面化、缺乏深度、逻辑跳跃
- 任务类：避免偏离主题、格式混乱、重点不清
- 生成类：避免过度复杂、缺乏注释、不可维护

### 2. 场景与氛围（具象化背景）
为你的目标创造具体情境：
- 时间：什么时候发生/使用
- 地点：在哪里进行/应用
- 人物：谁在参与/使用
- 情绪：什么样的基调和感觉

### 3. 风格与深度（表达方式）
定义独特的表达风格：
- 语言风格：正式/口语/诗意/技术性
- 思维深度：表层/分析/哲学/多维度
- 表达技巧：直白/隐喻/对比/递进

### 4. 核心聚焦（具体方向）
将宽泛主题收窄到具体角度：
- 主要论点或冲突点
- 需要建立的联系
- 必须涵盖的要素
- 独特的切入视角

### 5. 形式约束（创造性限制）
通过限制激发创造力：
- 篇幅限制（字数/段落数）
- 结构要求（开头/中间/结尾）
- 特殊限制（禁用词/必用词）
- 格式要求（对话/清单/图表）

### 6. 质量标准（成功标准）
定义什么是好的输出：
- 必须达到的效果
- 读者应有的感受
- 可检验的具体指标
- 与众不同的特质

## 第三步：输出优化后的提示词
将上述维度整合成一个结构清晰、约束明确、富有创造空间的提示词。

现在，请帮用户把它的提示词，优化成精准有力的提示词！

## 优化原则

1. **长度控制**
   - 原始提示词少于10字：详细优化（200-300字）
   - 原始提示词10-50字：适度优化（150-200字）
   - 原始提示词超过50字：精准优化（100-150字）

2. **输出格式**
   - 第一行：一句话说明核心任务
   - 使用数字编号列出具体要求（不超过5条）
   - 每条要求控制在30字以内
   - 使用具体、可执行的动词
   - 避免过度修饰，保持简洁有力

3. **常见误区避免**
   - 创作类：不要使用“突然”、“忽然”等懒惰词汇
   - 分析类：不要使用“众所周知”、“毋庸置疑”等空话
   - 任务类：不要使用“尽快”、“高质量”等模糊要求
   - 生成类：不要说“最佳实践”而不说明具体标准
   - **重要**：不要混合不同任务或添加无关内容，保持聚焦原始需求

请直接输出优化后的提示词，不需要解释说明。`

export function analyzePromptType(prompt: string): PromptType {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('写') || lowerPrompt.includes('创作') || lowerPrompt.includes('故事')) {
    return 'creative'
  } else if (lowerPrompt.includes('分析') || lowerPrompt.includes('比较') || lowerPrompt.includes('解释')) {
    return 'analytical'
  } else if (lowerPrompt.includes('总结') || lowerPrompt.includes('翻译') || lowerPrompt.includes('改写')) {
    return 'task'
  } else if (lowerPrompt.includes('生成') || lowerPrompt.includes('代码') || lowerPrompt.includes('创建')) {
    return 'generative'
  }
  
  return 'creative' // 默认
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
  // 直接使用新的优化模板，忽略问题答案
  return `${OPTIMIZATION_PROMPT}

[用户输入的提示词]
${originalPrompt}

**特别注意**：
1. 如果用户输入的是“这是一个...提示词”或“以下是...的prompt”，要先提取实际的功能需求
2. 优化后的第一句必须直接说明要做什么，不要以“作为...专家”开头
3. 不要添加与原始需求无关的内容
4. 不要混合其他任务的描述
5. 输出应该是一个完整、独立、可直接使用的提示词

## 输出示例
对于“周报生成”需求，应输出：
“请根据以下信息生成一份结构化的工作周报：
1. ...
2. ...”

而不是：
“作为一位深谙人性的内容创作专家，请帮我撰写一篇关于...”

请直接输出优化后的提示词，不需要其他解释或说明。`
}