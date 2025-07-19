'use client'

import { useState } from 'react'
import { PromptTemplate, GeneratorStep } from '../types'

interface PromptGeneratorProps {
  initialInput?: string
  onGenerate: (prompt: string) => void
  onBack: () => void
}

// 场景模板定义
const SCENE_TEMPLATES: PromptTemplate[] = [
  {
    id: 'writing',
    name: '创意写作',
    icon: 'fa-pen-fancy',
    description: '小说、文章、剧本等创作',
    color: 'purple',
    gradient: 'from-purple-400 to-pink-500',
    questions: [
      { id: 'genre', question: '你想写什么类型的内容？', placeholder: '例如：科幻小说、产品文案、博客文章' },
      { id: 'audience', question: '目标读者是谁？', placeholder: '例如：年轻人、专业人士、儿童' },
      { id: 'tone', question: '希望的语气风格？', placeholder: '例如：幽默、正式、温馨、专业' },
      { id: 'length', question: '大概需要多长的内容？', placeholder: '例如：500字、2000字、简短精炼' }
    ],
    template: '请你作为一位专业的{genre}作者，为{audience}创作一篇{tone}风格的内容，长度约{length}。'
  },
  {
    id: 'analysis',
    name: '数据分析',
    icon: 'fa-chart-line',
    description: '数据洞察、报告生成、趋势分析',
    color: 'green',
    gradient: 'from-green-400 to-teal-500',
    questions: [
      { id: 'data_type', question: '分析什么类型的数据？', placeholder: '例如：销售数据、用户行为、市场趋势' },
      { id: 'goal', question: '分析的主要目标？', placeholder: '例如：发现规律、预测趋势、找出问题' },
      { id: 'format', question: '需要什么格式的输出？', placeholder: '例如：详细报告、关键洞察、可视化建议' },
      { id: 'depth', question: '分析深度要求？', placeholder: '例如：表层总结、深入挖掘、专业建议' }
    ],
    template: '请分析这些{data_type}数据，目标是{goal}。请提供{format}，分析深度要求{depth}。'
  },
  {
    id: 'teaching',
    name: '教育辅导',
    icon: 'fa-graduation-cap',
    description: '知识讲解、课程设计、学习辅导',
    color: 'yellow',
    gradient: 'from-yellow-400 to-orange-500',
    questions: [
      { id: 'subject', question: '教授什么主题？', placeholder: '例如：数学概念、历史事件、编程技术' },
      { id: 'student_level', question: '学生的水平如何？', placeholder: '例如：初学者、有基础、专业水平' },
      { id: 'method', question: '偏好的教学方式？', placeholder: '例如：举例说明、互动问答、循序渐进' },
      { id: 'goal', question: '学习目标是什么？', placeholder: '例如：理解概念、应用实践、通过考试' }
    ],
    template: '请你作为{subject}老师，为{student_level}水平的学生讲解。使用{method}的方式，帮助达成{goal}的目标。'
  },
  {
    id: 'business',
    name: '商业咨询',
    icon: 'fa-briefcase',
    description: '战略规划、市场分析、商业建议',
    color: 'orange',
    gradient: 'from-orange-400 to-red-500',
    questions: [
      { id: 'industry', question: '所在行业领域？', placeholder: '例如：电商、教育、金融科技' },
      { id: 'challenge', question: '面临的主要挑战？', placeholder: '例如：增长瓶颈、竞争激烈、成本控制' },
      { id: 'resources', question: '可用资源情况？', placeholder: '例如：预算充足、团队精简、时间紧迫' },
      { id: 'objective', question: '期望达成的目标？', placeholder: '例如：提升营收、扩大市场、优化效率' }
    ],
    template: '作为{industry}行业的商业顾问，针对{challenge}的挑战，考虑到{resources}的资源情况，请提供达成{objective}目标的建议。'
  },
  {
    id: 'creative',
    name: '创意设计',
    icon: 'fa-palette',
    description: '设计理念、创意方案、视觉构思',
    color: 'pink',
    gradient: 'from-pink-400 to-rose-500',
    questions: [
      { id: 'project', question: '什么类型的设计项目？', placeholder: '例如：品牌设计、UI界面、海报设计' },
      { id: 'style', question: '期望的设计风格？', placeholder: '例如：极简主义、复古风、科技感' },
      { id: 'emotion', question: '想传达什么情感？', placeholder: '例如：专业可信、活力青春、温暖亲切' },
      { id: 'constraints', question: '有什么限制条件？', placeholder: '例如：品牌规范、预算限制、时间要求' }
    ],
    template: '请为{project}项目提供{style}风格的创意设计方案，要传达{emotion}的情感，同时考虑{constraints}的限制。'
  }
]

export default function PromptGenerator({ initialInput, onGenerate, onBack }: PromptGeneratorProps) {
  const [currentStep, setCurrentStep] = useState<GeneratorStep>('select-scene')
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [customPrompt, setCustomPrompt] = useState(initialInput || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('')

  const handleTemplateSelect = (template: PromptTemplate) => {
    if (template.isCustom) {
      setCurrentStep('custom')
    } else {
      setSelectedTemplate(template)
      setCurrentStep('answer-questions')
    }
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const isAllQuestionsAnswered = () => {
    if (!selectedTemplate) return false
    return selectedTemplate.questions.every(q => answers[q.id]?.trim())
  }

  const generatePrompt = () => {
    if (!selectedTemplate) return

    setIsGenerating(true)
    
    // 基于模板生成提示词
    let generatedPrompt = selectedTemplate.template
    
    // 替换占位符
    selectedTemplate.questions.forEach(q => {
      const placeholder = `{${q.id}}`
      const answer = answers[q.id] || ''
      generatedPrompt = generatedPrompt.replace(placeholder, answer)
    })

    // 添加额外的上下文和最佳实践
    const enhancedPrompt = `${generatedPrompt}

具体要求：
1. 保持${answers.tone || '专业'}的语气
2. 内容要${answers.depth || '详细且有深度'}
3. 确保对${answers.audience || '目标受众'}友好易懂
4. ${customPrompt ? `额外说明：${customPrompt}` : ''}`

    setTimeout(() => {
      setIsGenerating(false)
      setGeneratedPrompt(enhancedPrompt.trim())
      setCurrentStep('show-result')
    }, 1000)
  }

  const renderSceneSelection = () => (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extralight text-white mb-3">选择场景</h2>
        <p className="text-lg font-light text-gray-400">选择最符合你需求的场景，我们将引导你创建完美的提示词</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SCENE_TEMPLATES.map((template, index) => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="group relative"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* 悬停光晕 */}
            <div className={`absolute -inset-2 bg-gradient-to-r ${template.gradient} rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-all duration-700`} />
            
            {/* 卡片主体 */}
            <div className="relative h-56 p-6 rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/10 group-hover:border-white/20 transition-all duration-500 group-hover:bg-white/[0.06]">
              <div className="h-full flex flex-col items-center text-center">
                {/* 图标容器 */}
                <div className="mb-4">
                  <div className="w-20 h-20 relative group-hover:scale-105 transition-transform duration-500">
                    {/* 外层光晕 */}
                    <div className={`absolute -inset-2 bg-gradient-to-br ${template.gradient} rounded-3xl opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-700`} />
                    
                    {/* 背景层 */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} rounded-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                    
                    {/* 主图标容器 */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden">
                      {/* 内部渐变 */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-90`} />
                      
                      {/* 光泽效果 */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-white/0 to-transparent" />
                      
                      {/* 图标 - 几何诗意设计 */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {template.id === 'writing' && (
                          <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                            {/* 创意写作 - 圆与方的对话，象征思想与文字的转化 */}
                            <circle cx="24" cy="18" r="12" fill="white" opacity="0.2"/>
                            <rect x="18" y="18" width="12" height="18" fill="white" opacity="0.4"/>
                            <circle cx="24" cy="18" r="8" fill="none" stroke="white" strokeWidth="1" opacity="0.8"/>
                            <rect x="22" y="24" width="4" height="12" fill="white" opacity="0.9"/>
                          </svg>
                        )}
                        {template.id === 'analysis' && (
                          <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                            {/* 数据分析 - 三个递进的圆，象征层层深入的洞察 */}
                            <circle cx="16" cy="28" r="8" fill="white" opacity="0.3"/>
                            <circle cx="24" cy="20" r="10" fill="white" opacity="0.2"/>
                            <circle cx="32" cy="16" r="6" fill="white" opacity="0.5"/>
                            <path d="M16 28L24 20L32 16" stroke="white" strokeWidth="1" opacity="0.7"/>
                            <circle cx="32" cy="16" r="3" fill="white" opacity="0.9"/>
                          </svg>
                        )}
                        {template.id === 'teaching' && (
                          <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                            {/* 教育辅导 - 三角形的递进，象征知识的传承与升华 */}
                            <path d="M24 8 L36 28 L12 28 Z" fill="white" opacity="0.2"/>
                            <path d="M24 16 L32 28 L16 28 Z" fill="white" opacity="0.4"/>
                            <path d="M24 20 L28 28 L20 28 Z" fill="white" opacity="0.6"/>
                            <circle cx="24" cy="36" r="4" fill="white" opacity="0.8"/>
                          </svg>
                        )}
                        {template.id === 'business' && (
                          <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                            {/* 商业咨询 - 正方形的旋转叠加，象征多维度战略 */}
                            <rect x="12" y="12" width="24" height="24" fill="white" opacity="0.2" transform="rotate(0 24 24)"/>
                            <rect x="14" y="14" width="20" height="20" fill="white" opacity="0.3" transform="rotate(30 24 24)"/>
                            <rect x="16" y="16" width="16" height="16" fill="white" opacity="0.4" transform="rotate(45 24 24)"/>
                            <circle cx="24" cy="24" r="6" fill="none" stroke="white" strokeWidth="1" opacity="0.8"/>
                          </svg>
                        )}
                        {template.id === 'creative' && (
                          <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                            {/* 创意设计 - 六边形与圆的融合，象征理性与感性的平衡 */}
                            <path d="M24 8 L34.4 14 L34.4 26 L24 32 L13.6 26 L13.6 14 Z" fill="white" opacity="0.2"/>
                            <circle cx="24" cy="24" r="14" fill="none" stroke="white" strokeWidth="1" opacity="0.4"/>
                            <circle cx="24" cy="14" r="3" fill="white" opacity="0.7"/>
                            <circle cx="31" cy="20" r="3" fill="white" opacity="0.6"/>
                            <circle cx="31" cy="28" r="3" fill="white" opacity="0.5"/>
                            <circle cx="24" cy="34" r="3" fill="white" opacity="0.6"/>
                            <circle cx="17" cy="28" r="3" fill="white" opacity="0.5"/>
                            <circle cx="17" cy="20" r="3" fill="white" opacity="0.6"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    {/* 底部反射 */}
                    <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-8 bg-gradient-to-b ${template.gradient} opacity-20 blur-xl scale-y-50`} />
                  </div>
                </div>
                
                {/* 文字内容 */}
                <h3 className="text-lg font-light text-white mb-1 group-hover:text-white/90 transition-colors">{template.name}</h3>
                <p className="text-sm font-light text-gray-400 group-hover:text-gray-300 transition-colors">{template.description}</p>
              </div>
            </div>
          </button>
        ))}
        
        {/* 自定义提示词选项 - 特殊样式 */}
        <button
          onClick={() => setCurrentStep('custom')}
          className="group relative"
          style={{ animationDelay: `${SCENE_TEMPLATES.length * 0.1}s` }}
        >
          {/* 卡片主体 - 虚线边框样式 */}
          <div className="relative h-56 p-6 rounded-2xl backdrop-blur-xl bg-white/[0.02] border-2 border-dashed border-white/20 group-hover:border-white/40 transition-all duration-500 group-hover:bg-white/[0.04]">
            <div className="h-full flex flex-col items-center justify-center text-center">
              {/* 图标容器 - 更简约的设计 */}
              <div className="mb-4">
                <div className="w-20 h-20 relative group-hover:scale-105 transition-transform duration-500">
                  {/* 虚线圆形边框 */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-gray-600 group-hover:border-gray-500 transition-colors duration-500" />
                  
                  {/* 自定义图标 - 空与满的哲学 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                      {/* 虚线圆环，象征无限可能 */}
                      <circle cx="24" cy="24" r="16" fill="none" stroke="gray" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>
                      {/* 中心的十字，极简的创造符号 */}
                      <path d="M24 16 L24 32 M16 24 L32 24" stroke="gray" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                      {/* 四个角点，象征扩展的方向 */}
                      <circle cx="16" cy="16" r="1.5" fill="gray" opacity="0.3"/>
                      <circle cx="32" cy="16" r="1.5" fill="gray" opacity="0.3"/>
                      <circle cx="32" cy="32" r="1.5" fill="gray" opacity="0.3"/>
                      <circle cx="16" cy="32" r="1.5" fill="gray" opacity="0.3"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* 文字内容 */}
              <h3 className="text-lg font-light text-gray-400 mb-1 group-hover:text-gray-300 transition-colors">自定义提示词</h3>
              <p className="text-sm font-light text-gray-500 group-hover:text-gray-400 transition-colors">直接编写你的提示词</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )

  const renderQuestions = () => {
    if (!selectedTemplate) return null

    const currentQuestionIndex = selectedTemplate.questions.findIndex(
      q => !answers[q.id]?.trim()
    )
    const progress = (Object.keys(answers).filter(key => answers[key]?.trim()).length / selectedTemplate.questions.length) * 100

    // 获取场景对应的主题色样式
    const getThemeStyles = () => {
      const colorMap: Record<string, {
        glow: string
        border: string
        borderActive: string
        bg: string
        bgActive: string
        text: string
        accent: string
      }> = {
        'from-purple-400 to-pink-500': {
          glow: 'from-purple-500/20 to-pink-500/20',
          border: 'border-purple-500/20',
          borderActive: 'border-purple-500/40',
          bg: 'bg-purple-500/5',
          bgActive: 'bg-purple-500/10',
          text: 'text-purple-400',
          accent: 'text-purple-300'
        },
        'from-green-400 to-teal-500': {
          glow: 'from-green-500/20 to-teal-500/20',
          border: 'border-green-500/20',
          borderActive: 'border-green-500/40',
          bg: 'bg-green-500/5',
          bgActive: 'bg-green-500/10',
          text: 'text-green-400',
          accent: 'text-green-300'
        },
        'from-yellow-400 to-orange-500': {
          glow: 'from-yellow-500/20 to-orange-500/20',
          border: 'border-orange-500/20',
          borderActive: 'border-orange-500/40',
          bg: 'bg-orange-500/5',
          bgActive: 'bg-orange-500/10',
          text: 'text-orange-400',
          accent: 'text-orange-300'
        },
        'from-orange-400 to-red-500': {
          glow: 'from-orange-500/20 to-red-500/20',
          border: 'border-orange-500/20',
          borderActive: 'border-orange-500/40',
          bg: 'bg-orange-500/5',
          bgActive: 'bg-orange-500/10',
          text: 'text-orange-400',
          accent: 'text-orange-300'
        },
        'from-pink-400 to-rose-500': {
          glow: 'from-pink-500/20 to-rose-500/20',
          border: 'border-pink-500/20',
          borderActive: 'border-pink-500/40',
          bg: 'bg-pink-500/5',
          bgActive: 'bg-pink-500/10',
          text: 'text-pink-400',
          accent: 'text-pink-300'
        }
      }
      
      return colorMap[selectedTemplate?.gradient || 'from-purple-400 to-pink-500'] || colorMap['from-purple-400 to-pink-500']
    }

    const theme = getThemeStyles()

    return (
      <div className="animate-fade-in max-w-3xl mx-auto relative">
        {/* 主题色背景光晕 */}
        <div className={`absolute -inset-32 bg-gradient-to-r ${selectedTemplate.gradient} blur-3xl opacity-20 pointer-events-none`} />
        
        <div className="relative">
          {/* 进度条 */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-extralight text-white">{selectedTemplate.name}</h2>
              <span className={`text-sm font-light ${theme.text}`}>
                {Math.round(progress)}% 完成
              </span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${selectedTemplate.gradient} transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 问题列表 */}
          <div className="space-y-6">
            {selectedTemplate.questions.map((question, index) => (
              <div 
                key={question.id}
                className={`p-8 rounded-2xl backdrop-blur-xl ${
                  index === currentQuestionIndex ? theme.bgActive : theme.bg
                } border transition-all duration-300 ${
                  index === currentQuestionIndex 
                    ? `${theme.borderActive} scale-[1.02]` 
                    : theme.border
                }`}
              >
                <label className="block text-lg font-light text-white mb-4">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${theme.bg} ${theme.border} ${theme.accent} text-sm mr-3`}>
                    {index + 1}
                  </span>
                  {question.question}
                </label>
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  className={`w-full px-6 py-4 ${theme.bg} border ${theme.border} rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-200 font-light ${index === currentQuestionIndex ? `${theme.borderActive} ${theme.bgActive}` : ''} focus:${theme.borderActive} focus:${theme.bgActive}`}
                />
              </div>
            ))}
          </div>

        {/* 额外说明 */}
        <div className={`mt-8 p-8 rounded-2xl backdrop-blur-xl ${theme.bg} border ${theme.border}`}>
          <label className="block text-lg font-light text-white mb-4">
            <i className={`fas fa-plus-circle ${theme.text} mr-2`}></i>
            额外说明（可选）
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="如果有其他特殊要求，请在这里补充..."
            className={`w-full h-32 px-6 py-4 ${theme.bg} border ${theme.border} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:${theme.borderActive} focus:${theme.bgActive} transition-all duration-200 resize-none font-light`}
          />
        </div>

        {/* 操作按钮 */}
        <div className="mt-12 flex gap-4">
          <button
            onClick={() => setCurrentStep('select-scene')}
            className="px-8 py-4 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all duration-300 font-light"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            返回
          </button>
          <button
            onClick={generatePrompt}
            disabled={!isAllQuestionsAnswered() || isGenerating}
            className={`flex-1 py-4 rounded-xl font-light transition-all duration-300 ${
              isAllQuestionsAnswered() 
                ? `bg-gradient-to-r ${selectedTemplate.gradient} text-white hover:shadow-lg hover:shadow-${selectedTemplate.color}-500/25` 
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner fa-spin"></i>
                生成中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-sparkles"></i>
                生成提示词
              </span>
            )}
          </button>
        </div>
        </div>
      </div>
    )
  }

  const renderCustom = () => (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-extralight text-white mb-4">自定义提示词</h2>
        <p className="text-lg font-light text-gray-400">直接编写你的提示词，系统将帮你优化</p>
      </div>

      <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="在这里输入你的提示词..."
          className="w-full h-64 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200 resize-none font-light"
        />
      </div>

      <div className="mt-12 flex gap-4">
        <button
          onClick={() => setCurrentStep('select-scene')}
          className="px-8 py-4 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all duration-300 font-light"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          返回
        </button>
        <button
          onClick={() => {
            // 为自定义提示词设置一个特殊的模板
            setSelectedTemplate({
              id: 'custom',
              name: '自定义提示词',
              icon: 'fa-plus',
              description: '直接编写的提示词',
              color: 'emerald',
              gradient: 'from-emerald-400 to-teal-500',
              questions: [],
              template: ''
            })
            setGeneratedPrompt(customPrompt)
            setCurrentStep('show-result')
          }}
          disabled={!customPrompt.trim()}
          className={`flex-1 py-4 rounded-xl font-light transition-all duration-300 ${
            customPrompt.trim() 
              ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-white hover:shadow-lg hover:shadow-teal-500/25' 
              : 'bg-white/5 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <i className="fas fa-arrow-right"></i>
            生成提示词
          </span>
        </button>
      </div>
    </div>
  )

  const renderResult = () => {
    // 获取当前场景的颜色主题
    const currentGradient = selectedTemplate?.gradient || 'from-emerald-400 to-teal-500'
    const currentColor = selectedTemplate?.color || 'emerald'
    
    // 渲染场景对应的图标
    const renderIcon = () => {
      if (!selectedTemplate) return null
      
      switch (selectedTemplate.id) {
        case 'writing':
          return (
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="18" r="12" fill="white" opacity="0.2"/>
              <rect x="18" y="18" width="12" height="18" fill="white" opacity="0.4"/>
              <circle cx="24" cy="18" r="8" fill="none" stroke="white" strokeWidth="1" opacity="0.8"/>
              <rect x="22" y="24" width="4" height="12" fill="white" opacity="0.9"/>
            </svg>
          )
        case 'analysis':
          return (
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
              <circle cx="16" cy="28" r="8" fill="white" opacity="0.3"/>
              <circle cx="24" cy="20" r="10" fill="white" opacity="0.2"/>
              <circle cx="32" cy="16" r="6" fill="white" opacity="0.5"/>
              <path d="M16 28L24 20L32 16" stroke="white" strokeWidth="1" opacity="0.7"/>
              <circle cx="32" cy="16" r="3" fill="white" opacity="0.9"/>
            </svg>
          )
        case 'teaching':
          return (
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
              <path d="M24 8 L36 28 L12 28 Z" fill="white" opacity="0.2"/>
              <path d="M24 16 L32 28 L16 28 Z" fill="white" opacity="0.4"/>
              <path d="M24 20 L28 28 L20 28 Z" fill="white" opacity="0.6"/>
              <circle cx="24" cy="36" r="4" fill="white" opacity="0.8"/>
            </svg>
          )
        case 'business':
          return (
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
              <rect x="12" y="12" width="24" height="24" fill="white" opacity="0.2" transform="rotate(0 24 24)"/>
              <rect x="14" y="14" width="20" height="20" fill="white" opacity="0.3" transform="rotate(30 24 24)"/>
              <rect x="16" y="16" width="16" height="16" fill="white" opacity="0.4" transform="rotate(45 24 24)"/>
              <circle cx="24" cy="24" r="6" fill="none" stroke="white" strokeWidth="1" opacity="0.8"/>
            </svg>
          )
        case 'creative':
          return (
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
              <path d="M24 8 L34.4 14 L34.4 26 L24 32 L13.6 26 L13.6 14 Z" fill="white" opacity="0.2"/>
              <circle cx="24" cy="24" r="14" fill="none" stroke="white" strokeWidth="1" opacity="0.4"/>
              <circle cx="24" cy="14" r="3" fill="white" opacity="0.7"/>
              <circle cx="31" cy="20" r="3" fill="white" opacity="0.6"/>
              <circle cx="31" cy="28" r="3" fill="white" opacity="0.5"/>
              <circle cx="24" cy="34" r="3" fill="white" opacity="0.6"/>
              <circle cx="17" cy="28" r="3" fill="white" opacity="0.5"/>
              <circle cx="17" cy="20" r="3" fill="white" opacity="0.6"/>
            </svg>
          )
        case 'custom':
          return (
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="16" fill="none" stroke="white" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>
              <path d="M24 16 L24 32 M16 24 L32 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
              <circle cx="16" cy="16" r="1.5" fill="white" opacity="0.3"/>
              <circle cx="32" cy="16" r="1.5" fill="white" opacity="0.3"/>
              <circle cx="32" cy="32" r="1.5" fill="white" opacity="0.3"/>
              <circle cx="16" cy="32" r="1.5" fill="white" opacity="0.3"/>
            </svg>
          )
        default:
          return <i className="fas fa-check text-white text-3xl"></i>
      }
    }
    
    return (
      <div className="animate-fade-in">
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${currentGradient} rounded-3xl opacity-20`} />
            <div className={`absolute inset-0 bg-gradient-to-br ${currentGradient} rounded-3xl flex items-center justify-center`}>
              {renderIcon()}
            </div>
          </div>
          <h2 className="text-3xl font-light text-white mb-4">提示词生成成功！</h2>
          <p className="text-lg font-light text-gray-400">你的专属提示词已经准备就绪</p>
        </div>

        <div className="mb-8">
          <div className={`relative p-6 rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/10 hover:border-${currentColor}-500/30 transition-all duration-300`}>
            <h3 className="text-sm font-light text-gray-400 mb-4">生成的提示词</h3>
            <div className="text-white font-light leading-relaxed whitespace-pre-wrap">
              {generatedPrompt}
            </div>
            {/* 添加装饰性光晕 */}
            <div className={`absolute -inset-4 bg-gradient-to-r ${currentGradient} opacity-5 blur-3xl -z-10`} />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedPrompt)
              // 可以添加复制成功的提示
            }}
            className="flex-1 py-4 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-300 font-light"
          >
            <i className="fas fa-copy mr-2"></i>
            复制提示词
          </button>
          <button
            onClick={() => onGenerate(generatedPrompt)}
            className={`flex-1 py-4 rounded-xl bg-gradient-to-r ${currentGradient} text-white hover:shadow-lg hover:shadow-${currentColor}-500/25 transition-all duration-300 font-light`}
          >
            <i className="fas fa-wand-magic-sparkles mr-2"></i>
            优化提示词
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setCurrentStep('select-scene')
              setSelectedTemplate(null)
              setAnswers({})
              setGeneratedPrompt('')
            }}
            className="text-gray-400 hover:text-white transition-colors font-light"
          >
            <i className="fas fa-plus mr-2"></i>
            生成新的提示词
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* 背景渐变 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full filter blur-[160px]" />
      </div>

      <div className="relative z-10 min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 头部导航 */}
          <div className="flex items-center justify-between mb-12">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors font-light"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              返回
            </button>
            <div className="flex items-center gap-2 text-sm font-light text-gray-400">
              <i className="fas fa-sparkles text-emerald-400"></i>
              <span>提示词生成器</span>
            </div>
          </div>

          {/* 主内容区域 */}
          <div>
            {currentStep === 'select-scene' && renderSceneSelection()}
            {currentStep === 'answer-questions' && renderQuestions()}
            {currentStep === 'custom' && renderCustom()}
            {currentStep === 'show-result' && renderResult()}
          </div>
        </div>
      </div>
    </div>
  )
}