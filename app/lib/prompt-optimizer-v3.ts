/**
 * 提示词优化器 v3.0
 * 增强版 - 更准确理解"提示词"的本质
 */

export const ENHANCED_OPTIMIZATION_PROMPT = `你是一个专业的提示词工程师。

## 核心理解
"提示词"是给AI的指令，不是给人类的教程。用户需要的是一个可以直接复制粘贴使用的AI指令。

## 任务分析
用户输入：{userInput}

## 优化要求

### 1. 准确理解需求类型
- 如果用户说"写一个XXX的提示词" → 生成一个完整的、可直接使用的AI指令
- 如果用户说"优化这个提示词" → 改进现有提示词的结构和效果
- 如果用户只说了一个任务 → 为这个任务创建一个提示词

### 2. 提示词结构要求
一个优秀的提示词应该包含：
- 明确的任务定义（第一句话说清楚要AI做什么）
- 清晰的输入说明（什么格式的输入）
- 详细的处理步骤（如何处理）
- 具体的输出要求（输出什么格式）
- 质量控制标准（什么是好的结果）

### 3. 针对不同类型的优化策略

#### 工具类（如整理周报、处理数据）
必须包含：
- 输入数据格式说明
- 数据处理流程
- 输出格式模板
- 异常处理说明

示例框架：
"""
请根据以下[数据类型]生成[目标格式]：

输入格式：[详细说明输入数据的格式]

处理要求：
1. [具体处理步骤1]
2. [具体处理步骤2]
...

输出格式：
[具体的输出模板或格式说明]

质量要求：
- [质量标准1]
- [质量标准2]
"""

#### 创作类（如写故事、创作文案）
必须包含：
- 创作主题和风格
- 目标受众
- 篇幅和结构要求
- 创作要点

#### 分析类（如市场分析、竞品研究）
必须包含：
- 分析维度
- 数据来源
- 分析深度
- 结论格式

### 4. 输出要求
- 直接输出可以使用的提示词
- 不要输出使用说明或解释
- 提示词要完整、独立、可直接复制使用
- 使用清晰的结构和编号

## 现在，基于以上理解，为用户生成优化后的提示词：`

/**
 * 生成更智能的优化提示
 */
export function buildEnhancedOptimizationPrompt(userInput: string): string {
  return ENHANCED_OPTIMIZATION_PROMPT.replace('{userInput}', userInput)
}

/**
 * 提示词质量评估
 */
export function evaluatePromptQuality(prompt: string): {
  score: number
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100

  // 检查是否有明确的任务定义
  if (!prompt.match(/^(请|帮我|我需要|协助|完成|执行|分析|生成|创建|整理|处理)/)) {
    issues.push('缺少明确的任务定义')
    suggestions.push('在开头明确说明要AI执行什么任务')
    score -= 20
  }

  // 检查是否有输入说明
  if (!prompt.includes('输入') && !prompt.includes('格式') && !prompt.includes('数据')) {
    issues.push('缺少输入格式说明')
    suggestions.push('说明输入数据的格式和来源')
    score -= 15
  }

  // 检查是否有输出要求
  if (!prompt.includes('输出') && !prompt.includes('结果') && !prompt.includes('生成')) {
    issues.push('缺少输出格式说明')
    suggestions.push('明确输出的格式和结构')
    score -= 15
  }

  // 检查结构清晰度
  const hasNumbering = prompt.match(/\d+\.|[一二三四五六七八九十]+、/g)
  const hasBullets = prompt.includes('- ') || prompt.includes('• ')
  if (!hasNumbering && !hasBullets) {
    issues.push('结构不够清晰')
    suggestions.push('使用编号或列表来组织内容')
    score -= 10
  }

  // 检查具体性
  const vagueWords = ['可能', '大概', '也许', '一些', '某些', '适当']
  const vagueCount = vagueWords.filter(word => prompt.includes(word)).length
  if (vagueCount > 2) {
    issues.push('表述过于模糊')
    suggestions.push('使用更具体、明确的描述')
    score -= 5 * vagueCount
  }

  return { score: Math.max(0, score), issues, suggestions }
}

/**
 * 智能提示词模板生成器
 */
export function generateSmartTemplate(taskType: string, specificNeeds: string): string {
  const templates: Record<string, (needs: string) => string> = {
    'weekly_report': (needs) => `请将以下工作记录整理成结构化的周报：

输入格式：
- 日常工作流水账（文本形式）
- 会议记录和讨论要点
- 项目进展更新
- 遇到的问题和解决方案

处理要求：
1. 识别并提取本周完成的主要工作项
   - 合并相似或重复的任务
   - 按项目或领域分类
   - 突出关键成果和数据

2. 整理进行中的工作
   - 标注当前进度（百分比）
   - 说明预计完成时间
   - 标记依赖项和阻碍

3. 总结问题和需求
   - 技术难题及解决思路
   - 需要的资源或支持
   - 风险提示

4. 规划下周工作
   - 按优先级排序
   - 设定可量化目标
   - 标注关键里程碑

输出格式：
# 工作周报（YYYY年MM月DD日 - YYYY年MM月DD日）

## 一、本周工作完成情况
### 1.1 [项目/领域名称]
- **完成事项**：[具体成果，包含数据]
- **亮点成果**：[特别值得关注的成就]

## 二、进行中工作
| 任务名称 | 当前进度 | 预计完成时间 | 备注 |
|---------|---------|------------|------|
| [任务1] | XX% | [日期] | [说明] |

## 三、问题与需求
- **技术问题**：[问题描述] → [解决方案/需求]
- **资源需求**：[具体需求说明]

## 四、下周工作计划
1. 【高优先级】[具体任务] - [预期成果]
2. 【中优先级】[具体任务] - [预期成果]

质量要求：
- 用专业术语，避免口语化表达
- 数据支撑结论，避免空泛描述
- 篇幅控制在800-1200字
- 重点突出，层次分明`,

    'code_review': (needs) => `请对以下代码进行全面的代码审查：

输入说明：
- 代码片段或文件路径
- 编程语言类型
- 项目背景（可选）

审查维度：
1. 代码质量
   - 命名规范性
   - 代码可读性
   - 注释完整性

2. 潜在问题
   - 性能瓶颈
   - 安全漏洞
   - 错误处理

3. 最佳实践
   - 设计模式应用
   - 架构合理性
   - 代码复用性

4. 改进建议
   - 具体修改方案
   - 优化思路
   - 参考示例

输出格式：
## 代码审查报告

### 总体评分：[X/10]

### 优点
- [值得肯定的地方]

### 问题列表
1. 【严重程度：高/中/低】[问题描述]
   - 位置：[行号或函数名]
   - 影响：[潜在影响说明]
   - 建议：[具体修改建议]

### 改进建议
[详细的优化方案]

### 代码示例
\`\`\`[语言]
// 改进后的代码
\`\`\``,

    'data_analysis': (needs) => `请对提供的数据进行深入分析：

输入要求：
- 数据格式（CSV/JSON/文本描述）
- 数据时间范围
- 业务背景说明

分析任务：
1. 数据概览
   - 数据质量评估
   - 关键指标统计
   - 异常值识别

2. 趋势分析
   - 时间序列变化
   - 增长率计算
   - 周期性模式

3. 相关性分析
   - 指标间关系
   - 影响因素识别
   - 因果推断

4. 洞察提炼
   - 关键发现
   - 业务含义
   - 行动建议

输出格式：
## 数据分析报告

### 一、数据概览
- 数据量：[记录数]
- 时间跨度：[起止时间]
- 关键指标：[列出3-5个核心指标及其数值]

### 二、核心发现
1. **[发现标题]**
   - 数据支撑：[具体数据]
   - 业务解读：[含义说明]
   - 建议行动：[具体建议]

### 三、详细分析
[按维度展开的详细分析]

### 四、结论与建议
- 主要结论：[3-5条]
- 行动建议：[具体可执行的建议]
- 注意事项：[风险提示]`
  }

  // 查找匹配的模板
  for (const [key, generator] of Object.entries(templates)) {
    if (specificNeeds.toLowerCase().includes(key.replace('_', '')) || 
        specificNeeds.includes(key.split('_').join(''))) {
      return generator(specificNeeds)
    }
  }

  // 如果没有匹配的模板，返回通用框架
  return `请完成以下任务：

任务说明：${specificNeeds}

输入要求：
[请根据具体任务补充输入格式说明]

处理步骤：
1. [第一步操作]
2. [第二步操作]
3. [第三步操作]

输出要求：
[请根据具体任务补充输出格式要求]

质量标准：
- [标准1]
- [标准2]
- [标准3]`
}