'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import OptimizationFlow from '../components/OptimizationFlow'
import { OptimizationState } from '../types'
import Link from 'next/link'
import { 
  saveOptimizationProgress, 
  loadOptimizationProgress, 
  clearOptimizationProgress 
} from '../lib/optimization-store'
import SettingsPanel from '../components/SettingsPanel'
import { getUserTransitionPreference } from '../lib/transition-effects'

export default function OptimizerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [optimizationState, setOptimizationState] = useState<OptimizationState>({
    originalPrompt: '',
    stage: 'input',
    questions: [],
    answers: {},
    optimizedPrompt: '',
  })
  const [enableStreaming, setEnableStreaming] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [savedState, setSavedState] = useState<OptimizationState | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [transitionEffect, setTransitionEffect] = useState('fade')

  // 初始化：检查保存的进度和URL参数
  useEffect(() => {
    const initializeState = async () => {
      // 加载用户偏好
      setTransitionEffect(getUserTransitionPreference())
      
      // 尝试加载保存的进度
      const saved = loadOptimizationProgress()
      
      // 从URL读取参数
      const prompt = searchParams.get('prompt')
      const stage = searchParams.get('stage')
      const quickMode = searchParams.get('quick') === 'true'
      
      if (saved && saved.stage !== 'input' && saved.stage !== 'complete') {
        // 有未完成的进度
        setSavedState(saved)
        setShowResumeDialog(true)
      } else if (prompt) {
        // 从URL参数初始化
        setOptimizationState(prev => ({
          ...prev,
          originalPrompt: decodeURIComponent(prompt),
          stage: stage as any || 'input',
        }))
      }
      
      setIsLoading(false)
    }

    initializeState()
  }, [searchParams])

  // 监听浏览器后退/前进
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state?.optimizationState
      if (state) {
        setOptimizationState(state)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // 状态变化时保存
  useEffect(() => {
    if (!isLoading && optimizationState.stage !== 'input') {
      saveOptimizationProgress(optimizationState)
    }
  }, [optimizationState, isLoading])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC键返回首页
      if (e.key === 'Escape' && optimizationState.stage === 'input' && !showSettings) {
        router.push('/')
      }
      
      // Ctrl/Cmd + , 打开设置
      if (e.key === ',' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setShowSettings(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [optimizationState.stage, router, showSettings])

  // 页面过渡动画
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // 恢复进度对话框
  const ResumeDialog = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full animate-slide-up">
        <h3 className="text-2xl font-bold mb-4">发现未完成的优化</h3>
        <p className="text-gray-300 mb-6">
          您上次正在优化提示词: <span className="text-teal-400">"{savedState?.originalPrompt}"</span>
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setOptimizationState(savedState!)
              setShowResumeDialog(false)
            }}
            className="flex-1 px-6 py-3 gradient-button-primary rounded-xl font-medium transition-all duration-300"
          >
            继续优化
          </button>
          <button
            onClick={() => {
              clearOptimizationProgress()
              setShowResumeDialog(false)
            }}
            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-all duration-300"
          >
            重新开始
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <main className={`min-h-screen bg-black text-white relative overflow-hidden transition-${transitionEffect}-enter`}>
      {/* 背景效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute top-0 -left-4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* 顶部导航 */}
      <nav className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            <span>返回首页</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              title="设置 (Ctrl+,)"
            >
              <i className="fas fa-cog"></i>
              设置
            </button>
          </div>
        </div>
      </nav>

      {/* 主要内容区 */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <OptimizationFlow
            optimizationState={optimizationState}
            setOptimizationState={setOptimizationState}
            enableStreaming={enableStreaming}
            setEnableStreaming={setEnableStreaming}
          />
        </div>
      </div>

      {/* 底部信息 */}
      <footer className="relative z-10 px-4 py-6 text-center text-sm text-gray-500">
        <p>
          <i className="fas fa-shield-alt mr-2"></i>
          您的数据安全加密，我们不会存储任何敏感信息
        </p>
      </footer>

      {/* 恢复进度对话框 */}
      {showResumeDialog && savedState && <ResumeDialog />}

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        enableStreaming={enableStreaming}
        setEnableStreaming={setEnableStreaming}
      />
    </main>
  )
}