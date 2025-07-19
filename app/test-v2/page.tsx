'use client'

import { useState } from 'react'

export default function TestV2Page() {
  const [prompt, setPrompt] = useState('我想写一个针对整理周报的提示词')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'optimized'>('analysis')
  const [modelInfo, setModelInfo] = useState<string>('')

  const testAnalysis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/optimize/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          prompt
        })
      })
      const data = await response.json()
      setResult(data)
      setActiveTab('analysis')
    } catch (error) {
      console.error('测试失败:', error)
      setResult({ error: '测试失败' })
    } finally {
      setLoading(false)
    }
  }

  const testOptimize = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/optimize/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize',
          prompt
        })
      })
      const data = await response.json()
      setResult(data)
      setActiveTab('optimized')
    } catch (error) {
      console.error('优化失败:', error)
      setResult({ error: '优化失败' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">提示词优化 V2 测试</h1>
        <p className="text-sm text-gray-600 mb-8">
          当前使用模型：Claude Opus 4 (通过 OpenRouter)
        </p>
        
        {/* 输入区域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            输入你的提示词需求
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="例如：我想写一个针对整理周报的提示词"
          />
          
          <div className="mt-4 flex gap-4">
            <button
              onClick={testAnalysis}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              测试分析
            </button>
            <button
              onClick={testOptimize}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              测试优化
            </button>
          </div>
        </div>

        {/* 结果显示 */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex border-b mb-4">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'analysis' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600'
                }`}
              >
                分析结果
              </button>
              <button
                onClick={() => setActiveTab('optimized')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'optimized' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600'
                }`}
              >
                优化结果
              </button>
            </div>

            {activeTab === 'analysis' && result.analysis && (
              <div>
                <h3 className="font-bold mb-2">任务分析</h3>
                <div className="space-y-2 mb-4">
                  <p><span className="font-medium">任务类型:</span> {result.analysis.taskType}</p>
                  <p><span className="font-medium">用户意图:</span> {result.analysis.intent}</p>
                  <p><span className="font-medium">置信度:</span> {(result.analysis.confidence * 100).toFixed(0)}%</p>
                </div>

                {result.questions && (
                  <div>
                    <h3 className="font-bold mb-2">引导问题</h3>
                    <ul className="space-y-2">
                      {result.questions.map((q: any) => (
                        <li key={q.id} className="pl-4">
                          • {q.question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'optimized' && result.optimizedPrompt && (
              <div>
                <h3 className="font-bold mb-2">优化后的提示词</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">{result.optimizedPrompt}</pre>
                </div>

                {result.quality && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-md">
                    <h4 className="font-medium mb-2">质量评分：{result.quality.score}/100</h4>
                    {result.quality.issues && result.quality.issues.length > 0 && (
                      <div className="text-sm text-red-600">
                        <p className="font-medium">发现的问题：</p>
                        <ul className="list-disc pl-5">
                          {result.quality.issues.map((issue: string, i: number) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {result.suggestions && (
                  <div className="mt-4">
                    <h3 className="font-bold mb-2">改进建议</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {result.suggestions.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 调试信息 */}
            <details className="mt-6">
              <summary className="cursor-pointer text-gray-500 text-sm">
                查看完整响应 (调试)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}