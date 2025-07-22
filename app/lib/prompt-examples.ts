/**
 * 高质量提示词示例库
 * 收集经过验证的优秀提示词案例，用于学习和参考
 */

import { TaskType } from '../types/index'

export interface PromptExample {
  id: string
  category: TaskType
  title: string
  description: string
  original: string           // 原始提示词
  optimized: string         // 优化后的提示词
  score: {
    clarity: number
    completeness: number
    executability: number
    effectiveness: number
    overall: number
  }
  tags: string[]
  useCase: string          // 使用场景
  effectiveness: number    // 实际效果评分 1-5
  improvements: string[]   // 主要改进点
  author?: string         // 贡献者
  createdAt: string
}

// 提示词示例库
export const PROMPT_EXAMPLES: PromptExample[] = [
  // 创意写作类
  {
    id: 'creative-001',
    category: 'creative',
    title: '科普文章写作',
    description: '将模糊的写作需求转化为结构清晰的写作指南',
    original: '写一篇关于人工智能的文章',
    optimized: `【写作任务】
撰写一篇关于人工智能在日常生活中应用的科普文章

【具体要求】
- 字数：1500-2000字
- 受众：对科技感兴趣的普通读者（非专业人士）
- 语言：通俗易懂，避免专业术语，必要时提供解释

【文章结构】
1. 引人入胜的开头（200字）
   - 用生活化的场景引入AI话题
   - 提出读者关心的问题
   
2. AI应用实例（1000字）
   - 选择4-5个贴近生活的应用场景
   - 每个场景包括：具体描述、工作原理简述、实际好处
   - 建议场景：智能家居、医疗诊断、个性化推荐、智能客服等

3. 发展趋势展望（300字）
   - 近期可能实现的应用
   - 对生活的积极影响

4. 理性思考（200字）
   - 简要提及需要注意的问题
   - 保持乐观但不盲目的态度

【写作风格】
- 使用比喻和类比帮助理解
- 穿插具体的数据和案例
- 保持客观中立，不过度宣传
- 语气友好，像朋友聊天

【质量标准】
- 信息准确，有据可查
- 逻辑清晰，过渡自然
- 吸引读者，保持兴趣
- 有实用价值，读后有收获`,
    score: {
      clarity: 95,
      completeness: 98,
      executability: 96,
      effectiveness: 94,
      overall: 96
    },
    tags: ['写作', '科普', '结构化', 'AI主题'],
    useCase: '内容创作',
    effectiveness: 4.8,
    improvements: [
      '明确了字数要求和目标受众',
      '提供了详细的文章结构',
      '规定了写作风格和质量标准',
      '给出了具体的内容建议'
    ],
    createdAt: '2024-01-15'
  },

  // 数据分析类
  {
    id: 'analysis-001',
    category: 'analytical',
    title: '销售数据分析',
    description: '将简单的分析需求细化为完整的分析框架',
    original: '分析一下这个季度的销售数据',
    optimized: `【分析目标】
对Q4季度销售数据进行全面分析，识别业务趋势并提供可行建议

【数据范围】
- 时间：2024年Q4（10月1日-12月31日）
- 维度：产品类别、地区、客户类型、销售渠道
- 对比基准：同比（2023年Q4）、环比（2024年Q3）

【分析维度】
1. 整体业绩分析
   - 总销售额、订单量、客单价
   - 同比/环比增长率
   - 完成率（对比目标）

2. 细分市场表现
   - 各产品类别销售占比及增长
   - TOP10产品贡献度分析
   - 地区销售分布及变化
   - 新老客户占比及贡献

3. 趋势与模式识别
   - 月度/周度销售趋势
   - 季节性因素影响
   - 促销活动效果评估
   - 异常数据点分析

4. 问题诊断
   - 表现不佳的产品/地区原因分析
   - 客户流失情况
   - 库存周转问题

【输出要求】
1. 执行摘要（1页）
   - 关键发现3-5条
   - 主要问题2-3个
   - 核心建议3-4条

2. 详细分析报告
   - 数据可视化图表（柱状图、趋势图、饼图等）
   - 每个分析点配备数据支撑
   - 问题根因分析

3. 行动建议
   - 短期措施（1个月内）
   - 中期计划（1-3个月）
   - 需要的资源支持

【注意事项】
- 数据准确性验证
- 考虑外部因素影响（市场环境、竞争对手等）
- 建议要具体可执行
- 使用商业术语但避免过度复杂`,
    score: {
      clarity: 97,
      completeness: 96,
      executability: 95,
      effectiveness: 96,
      overall: 96
    },
    tags: ['数据分析', '商业', '报告', '结构化'],
    useCase: '商业分析',
    effectiveness: 4.9,
    improvements: [
      '明确了分析的时间范围和维度',
      '提供了完整的分析框架',
      '规定了具体的输出格式',
      '包含了实用的注意事项'
    ],
    createdAt: '2024-01-20'
  },

  // 工具使用类
  {
    id: 'tool-001',
    category: 'tool',
    title: 'Git工作流程',
    description: '将模糊的版本管理需求转化为清晰的操作步骤',
    original: '怎么用git管理代码',
    optimized: `【任务说明】
创建一个适合5人团队的Git工作流程规范

【具体需求】
- 团队规模：5人（2前端、2后端、1全栈）
- 项目类型：Web应用持续迭代开发
- 发布周期：双周发布

【工作流程设计】
1. 分支策略
   - main：生产环境代码，只接受merge request
   - develop：开发主分支，功能集成
   - feature/*：功能开发分支
   - hotfix/*：紧急修复分支
   - release/*：发布准备分支

2. 开发流程步骤
   \`\`\`bash
   # 1. 创建功能分支
   git checkout develop
   git pull origin develop
   git checkout -b feature/user-authentication
   
   # 2. 开发过程
   git add .
   git commit -m "feat: 实现用户登录功能"
   # 遵循约定式提交规范
   
   # 3. 推送并创建MR
   git push origin feature/user-authentication
   # 在GitLab/GitHub创建Merge Request
   \`\`\`

3. 代码审查要求
   - 至少1人审查通过
   - 通过CI/CD测试
   - 无冲突
   - 符合代码规范

4. 合并策略
   - feature -> develop: Squash and merge
   - develop -> main: Create a merge commit
   - hotfix -> main & develop: Cherry-pick

【提交信息规范】
格式：<type>(<scope>): <subject>

类型：
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建/工具

示例：
- feat(auth): 添加JWT认证
- fix(api): 修复用户查询接口报错
- docs(readme): 更新安装说明

【冲突解决原则】
1. 优先保证功能完整性
2. 遵循最新的代码规范
3. 不确定时询问代码作者
4. 解决后需重新测试

【工具配置】
- Git hooks: pre-commit进行代码检查
- CI/CD: 自动运行测试和构建
- 保护分支: main和develop设置保护规则`,
    score: {
      clarity: 98,
      completeness: 97,
      executability: 98,
      effectiveness: 96,
      overall: 97
    },
    tags: ['git', '版本控制', '团队协作', '工作流'],
    useCase: '开发流程',
    effectiveness: 4.9,
    improvements: [
      '提供了完整的分支策略',
      '包含具体的命令示例',
      '制定了清晰的规范',
      '考虑了团队协作场景'
    ],
    createdAt: '2024-01-25'
  },

  // 生成类
  {
    id: 'generative-001',
    category: 'generative',
    title: '产品描述生成',
    description: '将简单的生成需求扩展为详细的生成指南',
    original: '给我的产品写个介绍',
    optimized: `【生成任务】
为智能健康手环产品生成多渠道营销文案

【产品信息】
- 产品名称：FitPro X5 智能健康手环
- 目标用户：25-45岁注重健康的都市白领
- 核心卖点：24小时健康监测、AI健康建议、超长续航
- 价格定位：中高端（1299元）

【文案需求】
1. 电商详情页主文案（300字）
   结构：
   - 痛点引入（50字）：都市人的健康困扰
   - 产品价值（100字）：如何解决这些问题
   - 功能亮点（100字）：3-4个核心功能
   - 行动召唤（50字）：促进购买决策

2. 社交媒体推广文案（3版本）
   - 微博版（140字内）：话题性、传播性
   - 小红书版（200字）：生活方式、使用体验
   - 抖音视频脚本（30秒）：视觉呈现+配音文案

3. 产品卖点提炼（一句话版本）
   - 电梯pitch（15字内）
   - 广告语（10字内）
   - 产品副标题（20字内）

【文案风格】
- 语气：专业可信但不失亲和力
- 情感：激发健康生活的向往
- 避免：过度宣传、虚假承诺
- 强调：科技感、品质感、实用性

【关键词融入】
必须包含：智能监测、AI分析、健康管理、续航持久
可选包含：心率监测、睡眠分析、运动记录、健康提醒

【差异化要点】
- 对比市场同类产品，突出我们的优势
- 不直接贬低竞品，但要暗示我们的领先
- 强调性价比和品牌可靠性

【效果目标】
- 提高产品认知度
- 建立专业形象
- 刺激购买欲望
- 便于记忆和传播`,
    score: {
      clarity: 96,
      completeness: 98,
      executability: 95,
      effectiveness: 96,
      overall: 96
    },
    tags: ['文案', '营销', '产品推广', '多渠道'],
    useCase: '营销文案',
    effectiveness: 4.7,
    improvements: [
      '明确了产品定位和目标用户',
      '提供了多渠道文案需求',
      '规定了文案风格和关键词',
      '设定了明确的效果目标'
    ],
    createdAt: '2024-02-01'
  },

  // 通用类优化示例
  {
    id: 'general-001',
    category: 'general',
    title: '会议纪要整理',
    description: '将简单的整理需求转化为系统的工作指南',
    original: '整理一下今天的会议纪要',
    optimized: `【任务目标】
整理2024年2月1日产品规划会议纪要，产出结构化、可执行的会议记录

【会议信息】
- 日期时间：2024年2月1日 14:00-16:00
- 参会人员：产品、研发、市场、运营各部门负责人
- 会议主题：Q1产品路线图讨论

【整理要求】
1. 信息结构
   - 会议概要（时间、地点、参会人、主持人）
   - 议题列表（按重要性排序）
   - 决议事项（明确的结论）
   - 行动计划（任务分配）
   - 待定事项（需后续跟进）

2. 内容整理原则
   - 保留关键信息，删除冗余内容
   - 使用专业术语保持准确性
   - 决策过程简要说明原因
   - 数据和时间必须准确

3. 格式规范
   \`\`\`markdown
   # 产品规划会议纪要
   
   ## 会议信息
   - **时间**：2024-02-01 14:00-16:00
   - **地点**：会议室A
   - **主持**：张经理
   - **记录**：李助理
   
   ## 议题讨论
   ### 1. 新功能开发优先级
   **背景**：...
   **讨论要点**：
   - 观点1：...
   - 观点2：...
   **决议**：...
   
   ## 行动计划
   | 任务 | 负责人 | 截止日期 | 备注 |
   |------|--------|----------|------|
   | 竞品分析报告 | 王经理 | 2024-02-08 | 重点关注X功能 |
   \`\`\`

4. 重点标注
   - 🔴 重要决策
   - 🟡 待确认事项  
   - 🟢 已完成讨论
   - 📅 时间节点
   - 👤 责任人

【输出物】
1. 完整会议纪要（Markdown格式）
2. 行动项清单（表格形式）
3. 关键决策摘要（1页PPT）
4. 邮件通知版本（简洁版）

【质量检查】
- 信息完整性：所有重要内容都已记录
- 准确性：人名、日期、数据无误
- 可执行性：行动项明确可跟踪
- 可读性：结构清晰，易于浏览`,
    score: {
      clarity: 97,
      completeness: 96,
      executability: 97,
      effectiveness: 95,
      overall: 96
    },
    tags: ['会议纪要', '文档整理', '项目管理'],
    useCase: '办公协作',
    effectiveness: 4.8,
    improvements: [
      '提供了明确的整理结构',
      '规定了具体的格式规范',
      '包含了实用的标注系统',
      '明确了多种输出格式'
    ],
    createdAt: '2024-02-05'
  }
]

// 获取特定类别的示例
export function getExamplesByCategory(category: TaskType): PromptExample[] {
  return PROMPT_EXAMPLES.filter(example => example.category === category)
}

// 获取高分示例（overall >= 95）
export function getHighScoreExamples(): PromptExample[] {
  return PROMPT_EXAMPLES.filter(example => example.score.overall >= 95)
}

// 根据标签获取示例
export function getExamplesByTag(tag: string): PromptExample[] {
  return PROMPT_EXAMPLES.filter(example => 
    example.tags.includes(tag)
  )
}

// 搜索示例（基于标题、描述、标签）
export function searchExamples(query: string): PromptExample[] {
  const lowerQuery = query.toLowerCase()
  return PROMPT_EXAMPLES.filter(example => 
    example.title.toLowerCase().includes(lowerQuery) ||
    example.description.toLowerCase().includes(lowerQuery) ||
    example.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    example.useCase.toLowerCase().includes(lowerQuery)
  )
}

// 获取最新示例
export function getRecentExamples(limit: number = 5): PromptExample[] {
  return [...PROMPT_EXAMPLES]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

// 获取相似示例（基于简单的关键词匹配）
export function getSimilarExamples(input: string, limit: number = 3): PromptExample[] {
  const keywords = input.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  
  const scored = PROMPT_EXAMPLES.map(example => {
    let score = 0
    const exampleText = `${example.title} ${example.description} ${example.original} ${example.tags.join(' ')}`.toLowerCase()
    
    keywords.forEach(keyword => {
      if (exampleText.includes(keyword)) {
        score += 1
      }
    })
    
    return { example, score }
  })
  
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.example)
}