'use client'

import { useState, useEffect, useRef } from 'react'
import { Question } from '../types'
import { generateSmartDefaults, generateQuickOptimizationDescription } from '../lib/smart-defaults'

interface OptimizationQuestionsProps {
  questions: Question[]
  onComplete: (answers: Record<string, string>) => void
  onBack: () => void
  originalPrompt?: string
  promptType?: string
}

export default function OptimizationQuestions({ 
  questions, 
  onComplete,
  onBack,
  originalPrompt = '',
  promptType = 'creative'
}: OptimizationQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showQuickOptimizeHint, setShowQuickOptimizeHint] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex) / questions.length) * 100
  const currentAnswer = answers[currentQuestion?.id] || ''
  
  // 快速优化功能
  const handleQuickOptimization = () => {
    const smartDefaults = generateSmartDefaults(originalPrompt, promptType as any)
    onComplete(smartDefaults.answers)
  }
  
  // 当问题变化时自动聚焦
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [currentIndex])

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setIsTransitioning(false)
      }, 300)
    } else {
      // Complete
      onComplete(answers)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter 提交
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleNext() // 允许跳过任何问题
    }
    // ESC 返回上一步
    if (e.key === 'Escape') {
      e.preventDefault()
      if (currentIndex > 0) {
        handlePrevious()
      } else {
        onBack()
      }
    }
  }

  // Quick answers for common scenarios
  const quickAnswers = [
    { text: '专业深度', value: '需要专业、深入、有见解的内容' },
    { text: '简洁明了', value: '希望简洁清晰，重点突出' },
    { text: '创意新颖', value: '追求创新和独特的视角' },
  ]

  return (
    <div className="w-full">
      {/* 快速优化提示 - 只在第一个问题时显示 */}
      {currentIndex === 0 && showQuickOptimizeHint && (
        <div className="mb-6 p-4 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-xl animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-white font-medium mb-1 flex items-center gap-2">
                <i className="fas fa-bolt text-teal-400"></i>
                懒人模式
              </h4>
              <p className="text-sm text-gray-300 mb-3">
                不想回答问题？直接使用智能优化，我们会根据你的提示词自动配置最佳参数
              </p>
              <button
                onClick={handleQuickOptimization}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 flex items-center gap-2"
              >
                <i className="fas fa-magic"></i>
                一键智能优化
              </button>
            </div>
            <button
              onClick={() => setShowQuickOptimizeHint(false)}
              className="ml-4 text-gray-500 hover:text-gray-400 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-white">优化你的提示词</h3>
          <span className="text-sm text-gray-400">{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progress + (100 / questions.length)}%` }}
          />
        </div>
      </div>

      {/* Question Section */}
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
        <h2 className="text-2xl font-semibold text-white mb-6">
          {currentQuestion?.text}
        </h2>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={currentAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="分享你的想法..."
          className="w-full h-32 p-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-white placeholder-gray-500 transition-all"
          autoFocus
        />

        {/* Quick Answers */}
        {currentIndex === 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">快速选择：</span>
            {quickAnswers.map((quick, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerChange(quick.value)}
                className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                {quick.text}
              </button>
            ))}
          </div>
        )}

        {/* Hint Text */}
        <p className="mt-3 text-sm text-gray-500">
          💡 提示：{currentIndex === 0 ? '回答问题可以获得更精准的优化效果，或点击"直接优化"使用智能配置' : '可选问题，可直接跳过或使用"直接优化"'}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentIndex === 0 ? (
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-arrow-left text-sm"></i>
              返回修改
            </button>
          ) : (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-chevron-left text-sm"></i>
              上一步
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* 快速优化按钮 - 在所有步骤都显示 */}
          <button
            onClick={handleQuickOptimization}
            className="px-4 py-2 border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 rounded-xl transition-all duration-300 flex items-center gap-2"
            title="使用智能默认配置直接优化"
          >
            <i className="fas fa-bolt text-sm"></i>
            <span className="hidden sm:inline">直接优化</span>
          </button>
          
          <button
            onClick={() => handleAnswerChange('')}
            className="px-4 py-2 text-gray-500 hover:text-gray-400 transition-colors"
          >
            跳过
          </button>
          
          <button
            onClick={handleNext}
            className="px-6 py-2.5 gradient-button-primary text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 group"
          >
            <span>{currentIndex === questions.length - 1 ? '开始优化' : '下一步'}</span>
            <i className={`fas ${currentIndex === questions.length - 1 ? 'fa-magic' : 'fa-arrow-right'} text-sm group-hover:translate-x-0.5 transition-transform`}></i>
          </button>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="mt-8 flex justify-center gap-2">
        {questions.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex 
                ? 'w-8 bg-gradient-to-r from-teal-500 to-emerald-500' 
                : idx < currentIndex 
                  ? 'bg-teal-600' 
                  : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  )
}