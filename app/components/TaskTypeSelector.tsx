'use client'

import { TaskType } from '../types/index'

interface TaskTypeSelectorProps {
  detectedType: TaskType | null
  selectedType: TaskType | null
  onTypeChange: (type: TaskType) => void
}

const TASK_TYPES: Array<{
  type: TaskType
  label: string
  description: string
  icon: string
  examples: string[]
}> = [
  {
    type: 'tool',
    label: '工具类',
    description: '整理、处理、转换数据或文档',
    icon: '🔧',
    examples: ['整理周报', '处理数据', '格式转换']
  },
  {
    type: 'creative',
    label: '创作类',
    description: '写作、创作、编写内容',
    icon: '✨',
    examples: ['写文章', '创作故事', '编写文案']
  },
  {
    type: 'analytical',
    label: '分析类',
    description: '分析、比较、评估信息',
    icon: '📊',
    examples: ['数据分析', '市场调研', '竞品分析']
  },
  {
    type: 'generative',
    label: '生成类',
    description: '生成代码、方案或列表',
    icon: '🚀',
    examples: ['生成代码', '制定方案', '创建清单']
  }
]

export default function TaskTypeSelector({ detectedType, selectedType, onTypeChange }: TaskTypeSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-200 mb-3">
        任务类型
        {detectedType && (
          <span className="ml-2 text-xs text-purple-400">
            (AI 推荐: {TASK_TYPES.find(t => t.type === detectedType)?.label})
          </span>
        )}
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TASK_TYPES.map((taskType) => {
          const isSelected = selectedType === taskType.type
          const isDetected = detectedType === taskType.type
          
          return (
            <button
              key={taskType.type}
              type="button"
              onClick={() => {
                console.log('Task type clicked:', taskType.type)
                onTypeChange(taskType.type)
              }}
              className={`
                relative p-4 rounded-xl border transition-all duration-300 cursor-pointer
                ${isSelected 
                  ? 'bg-purple-500/20 border-purple-400/60 text-white shadow-lg shadow-purple-500/10' 
                  : 'bg-gray-800/40 border-gray-700 text-gray-200 hover:bg-gray-800/60 hover:text-white hover:border-gray-600'
                }
              `}
              style={{ zIndex: 10 }}
            >
              {isDetected && !isSelected && (
                <div className="absolute -top-2 -right-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              )}
              
              <div className="text-2xl mb-2">{taskType.icon}</div>
              <div className="text-sm font-medium mb-1">{taskType.label}</div>
              <div className="text-xs text-gray-400 line-clamp-2">{taskType.description}</div>
              
              {isSelected && (
                <div className="absolute inset-0 rounded-xl border-2 border-purple-500/50 pointer-events-none" />
              )}
            </button>
          )
        })}
      </div>
      
      {selectedType && (
        <div className="mt-3 text-xs text-gray-400">
          示例：{TASK_TYPES.find(t => t.type === selectedType)?.examples.join('、')}
        </div>
      )}
    </div>
  )
}