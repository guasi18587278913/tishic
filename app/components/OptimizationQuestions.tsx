'use client'

import { useState, useEffect, useRef } from 'react'
import { Question } from '../types'

interface OptimizationQuestionsProps {
  questions: Question[]
  onComplete: (answers: Record<string, string>) => void
  onBack: () => void
}

export default function OptimizationQuestions({ 
  questions, 
  onComplete,
  onBack
}: OptimizationQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex) / questions.length) * 100
  const currentAnswer = answers[currentQuestion?.id] || ''
  
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
      if (currentAnswer.trim() || currentIndex > 0) {
        handleNext()
      }
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
          💡 提示：{currentIndex === 0 ? '详细描述你的需求，有助于生成更精准的提示词' : '可选问题，按 Ctrl+Enter 快速跳到下一个'}
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
          <button
            onClick={() => handleAnswerChange('')}
            className="px-4 py-2 text-gray-500 hover:text-gray-400 transition-colors"
          >
            跳过
          </button>
          
          <button
            onClick={handleNext}
            disabled={!currentAnswer.trim() && currentIndex === 0} // First question is required
            className="px-6 py-2.5 gradient-button-primary text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
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