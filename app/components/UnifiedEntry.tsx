'use client'

import { useState, useEffect, useRef } from 'react'

interface UnifiedEntryProps {
  onModeSelect: (mode: 'generate' | 'optimize') => void
}

export default function UnifiedEntry({ onModeSelect }: UnifiedEntryProps) {
  const [hoveredCard, setHoveredCard] = useState<'generate' | 'optimize' | null>(null)
  const generateCardRef = useRef<HTMLDivElement>(null)
  const optimizeCardRef = useRef<HTMLDivElement>(null)

  // 3D 倾斜效果
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const applyTilt = (card: HTMLDivElement | null, isHovered: boolean) => {
        if (!card || !isHovered) {
          if (card) {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)'
          }
          return
        }

        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2

        const tiltX = -(y / rect.height) * 10
        const tiltY = (x / rect.width) * 10

        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`
      }

      applyTilt(generateCardRef.current, hoveredCard === 'generate')
      applyTilt(optimizeCardRef.current, hoveredCard === 'optimize')
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [hoveredCard])

  // 键盘导航
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '1') onModeSelect('generate')
      if (e.key === '2') onModeSelect('optimize')
      if (e.key === 'ArrowLeft') onModeSelect('generate')
      if (e.key === 'ArrowRight') onModeSelect('optimize')
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onModeSelect])

  return (
    <div className="fixed inset-0 bg-black">
      {/* 背景渐变 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full filter blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[128px]" />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 h-full flex items-center justify-center px-8">
        <div className="max-w-6xl w-full">
          {/* 标题 */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl font-light text-white mb-4 tracking-wide">
              选择你的创作方式
            </h1>
            <p className="text-lg text-gray-300 font-normal">
              按数字键 1/2 或使用方向键快速选择
            </p>
          </div>

          {/* 选择卡片 */}
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* 生成新提示词 */}
            <div
              ref={generateCardRef}
              onClick={() => onModeSelect('generate')}
              onMouseEnter={() => setHoveredCard('generate')}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative group cursor-pointer"
              style={{ transition: 'transform 0.1s ease-out' }}
            >
              {/* 光晕效果 */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              
              {/* 卡片主体 */}
              <div className="relative h-80 p-8 rounded-2xl backdrop-blur-xl bg-gray-800/50 border border-gray-700 group-hover:border-emerald-500/50 group-hover:bg-gray-800/70 transition-all duration-300">
                {/* 内容 */}
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto mb-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl opacity-20" />
                      <div className="absolute inset-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                          {/* 生成新提示词 - 创造的瞬间 */}
                          <circle cx="24" cy="24" r="18" fill="white" opacity="0.1"/>
                          {/* 中心点 - 原点 */}
                          <circle cx="24" cy="24" r="3" fill="white" opacity="0.9"/>
                          {/* 四方扩散 - 创造力的绽放 */}
                          <rect x="22" y="10" width="4" height="8" fill="white" opacity="0.6"/>
                          <rect x="22" y="30" width="4" height="8" fill="white" opacity="0.6"/>
                          <rect x="10" y="22" width="8" height="4" fill="white" opacity="0.6"/>
                          <rect x="30" y="22" width="8" height="4" fill="white" opacity="0.6"/>
                          {/* 角落星点 - 灵感火花 */}
                          <circle cx="16" cy="16" r="2" fill="white" opacity="0.4"/>
                          <circle cx="32" cy="16" r="2" fill="white" opacity="0.4"/>
                          <circle cx="32" cy="32" r="2" fill="white" opacity="0.4"/>
                          <circle cx="16" cy="32" r="2" fill="white" opacity="0.4"/>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-normal text-white mb-3">
                      生成新提示词
                    </h3>
                    <p className="text-gray-300 font-normal leading-relaxed">
                      通过引导式问答<br />从零开始创建专业提示词
                    </p>
                  </div>
                  
                  {/* 快捷键提示 */}
                  <div className="mt-auto">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white/60 text-sm font-light">
                      1
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 优化现有提示词 */}
            <div
              ref={optimizeCardRef}
              onClick={() => onModeSelect('optimize')}
              onMouseEnter={() => setHoveredCard('optimize')}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative group cursor-pointer"
              style={{ transition: 'transform 0.1s ease-out' }}
            >
              {/* 光晕效果 */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              
              {/* 卡片主体 */}
              <div className="relative h-80 p-8 rounded-2xl backdrop-blur-xl bg-gray-800/50 border border-gray-700 group-hover:border-purple-500/50 group-hover:bg-gray-800/70 transition-all duration-300">
                {/* 内容 */}
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto mb-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-20" />
                      <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                          {/* 优化现有提示词 - 精炼与升华 */}
                          {/* 原石 - 未经雕琢 */}
                          <rect x="14" y="14" width="20" height="20" fill="white" opacity="0.2" transform="rotate(15 24 24)"/>
                          {/* 切割面1 - 精炼过程 */}
                          <path d="M24 10 L34 20 L24 30 L14 20 Z" fill="white" opacity="0.4"/>
                          {/* 切割面2 - 多角度优化 */}
                          <path d="M24 18 L30 24 L24 30 L18 24 Z" fill="white" opacity="0.6"/>
                          {/* 核心光芒 - 精华所在 */}
                          <circle cx="24" cy="24" r="4" fill="white" opacity="0.9"/>
                          {/* 光芒四射 - 优化效果 */}
                          <circle cx="24" cy="12" r="1.5" fill="white" opacity="0.5"/>
                          <circle cx="36" cy="24" r="1.5" fill="white" opacity="0.5"/>
                          <circle cx="24" cy="36" r="1.5" fill="white" opacity="0.5"/>
                          <circle cx="12" cy="24" r="1.5" fill="white" opacity="0.5"/>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-normal text-white mb-3">
                      优化现有提示词
                    </h3>
                    <p className="text-gray-300 font-normal leading-relaxed">
                      智能分析并改进<br />让你的提示词更加精准
                    </p>
                  </div>
                  
                  {/* 快捷键提示 */}
                  <div className="mt-auto">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white/60 text-sm font-light">
                      2
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}