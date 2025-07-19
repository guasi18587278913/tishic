'use client'

import { useState, useEffect } from 'react'
import { 
  transitionEffects, 
  TransitionEffect,
  getUserTransitionPreference,
  saveUserTransitionPreference
} from '../lib/transition-effects'
import { getModelInfo } from '../lib/model-config'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  enableStreaming: boolean
  setEnableStreaming: (value: boolean) => void
}

export default function SettingsPanel({
  isOpen,
  onClose,
  enableStreaming,
  setEnableStreaming
}: SettingsPanelProps) {
  const [selectedTransition, setSelectedTransition] = useState<TransitionEffect>('fade')
  const [showPreview, setShowPreview] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [modelInfo, setModelInfo] = useState<any>(null)

  useEffect(() => {
    setSelectedTransition(getUserTransitionPreference())
    
    // 读取自动保存设置
    const savedAutoSave = localStorage.getItem('auto-save-progress')
    setAutoSave(savedAutoSave !== 'false')
    
    // 获取模型信息
    const model = getModelInfo('google/gemini-2.5-pro')
    setModelInfo(model)
  }, [])

  const handleTransitionChange = (effect: TransitionEffect) => {
    setSelectedTransition(effect)
    saveUserTransitionPreference(effect)
    
    // 预览效果
    setShowPreview(true)
    setTimeout(() => setShowPreview(false), transitionEffects[effect].duration + 100)
  }

  const handleAutoSaveChange = (value: boolean) => {
    setAutoSave(value)
    localStorage.setItem('auto-save-progress', value.toString())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <i className="fas fa-cog text-teal-400"></i>
            设置
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <i className="fas fa-times text-gray-400"></i>
          </button>
        </div>

        {/* 设置项 */}
        <div className="space-y-8">
          {/* 过渡效果 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-magic text-teal-400"></i>
              页面过渡效果
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(transitionEffects).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleTransitionChange(key as TransitionEffect)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedTransition === key
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium mb-1">{config.name}</div>
                  <div className="text-xs text-gray-400">{config.description}</div>
                </button>
              ))}
            </div>
            
            {/* 预览区域 */}
            {showPreview && (
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <div className={`${transitionEffects[selectedTransition].className}-enter p-4 bg-gray-800 rounded`}>
                  预览效果
                </div>
              </div>
            )}
          </div>

          {/* 模型信息 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-brain text-teal-400"></i>
              AI 模型
            </h3>
            
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <i className="fas fa-gem text-white"></i>
                </div>
                <div>
                  <h4 className="font-medium">{modelInfo?.name || 'Gemini 2.5 Pro'}</h4>
                  <p className="text-sm text-gray-400">{modelInfo?.description || 'Google 最新 AI 模型'}</p>
                </div>
              </div>
              <div className="text-sm text-gray-400 space-y-2">
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-teal-400"></i>
                  <span>优秀的中文理解能力</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-teal-400"></i>
                  <span>支持超长输出（{modelInfo?.maxTokens || 32768} tokens）</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-teal-400"></i>
                  <span>{modelInfo?.speed || '快速'}响应，性能稳定</span>
                </div>
                {modelInfo?.cost && (
                  <div className="flex items-center gap-2">
                    <i className="fas fa-dollar-sign text-teal-400"></i>
                    <span>成本：{modelInfo.cost}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 流式输出 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-stream text-teal-400"></i>
              输出模式
            </h3>
            <label className="flex items-center justify-between p-4 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors">
              <div>
                <div className="font-medium">流式输出</div>
                <div className="text-sm text-gray-400 mt-1">
                  实时显示优化结果，提供更好的交互体验
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={enableStreaming}
                  onChange={(e) => setEnableStreaming(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  enableStreaming ? 'bg-teal-500' : 'bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    enableStreaming ? 'translate-x-6' : 'translate-x-0.5'
                  } transform mt-0.5`}></div>
                </div>
              </div>
            </label>
          </div>

          {/* 自动保存 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-save text-teal-400"></i>
              进度保存
            </h3>
            <label className="flex items-center justify-between p-4 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors">
              <div>
                <div className="font-medium">自动保存进度</div>
                <div className="text-sm text-gray-400 mt-1">
                  自动保存优化进度，下次访问时可以继续
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => handleAutoSaveChange(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  autoSave ? 'bg-teal-500' : 'bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    autoSave ? 'translate-x-6' : 'translate-x-0.5'
                  } transform mt-0.5`}></div>
                </div>
              </div>
            </label>
          </div>

          {/* 快捷键说明 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-keyboard text-teal-400"></i>
              快捷键
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300">提交 / 下一步</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl + Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300">返回 / 上一步</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded">ESC</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300">打开设置</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl + ,</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 gradient-button-primary rounded-xl font-medium transition-all duration-300"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  )
}