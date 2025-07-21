'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Hero() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      {/* 微妙的背景光晕 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-500/3 rounded-full filter blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-500/3 rounded-full filter blur-[160px]" />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 text-center px-4 animate-fade-in">
        {/* 标题 */}
        <h1 className="text-6xl md:text-7xl font-light text-white mb-6 tracking-tight">
          提示词优化助手
        </h1>
        
        {/* 副标题 */}
        <p className="text-xl md:text-2xl font-normal text-gray-300 mb-20 tracking-wide">
          The Most Powerful AI Prompt Optimizer
        </p>

        {/* 主按钮 */}
        <div className="flex justify-center">
          <Link
            href="/app"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative"
          >
            {/* 光晕效果 */}
            <div className={`absolute -inset-8 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-3xl blur-2xl transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
            
            {/* 按钮容器 */}
            <div className="relative flex flex-col items-center">
              {/* 毛玻璃背景 */}
              <div className="relative w-32 h-32 rounded-3xl backdrop-blur-xl bg-gray-800/50 border border-gray-700 group-hover:border-teal-500/50 transition-all duration-300 group-hover:scale-105">
                {/* 渐变背景 */}
                <div className="absolute inset-4 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                  {/* 极简几何箭头 - 前进的诗意 */}
                  <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                    {/* 圆环 - 循环与完整 */}
                    <circle cx="24" cy="24" r="16" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
                    {/* 核心圆 - 起点 */}
                    <circle cx="20" cy="24" r="6" fill="white" opacity="0.2"/>
                    {/* 三条渐进的线 - 动态与方向 */}
                    <rect x="24" y="23" width="8" height="2" fill="white" opacity="0.4"/>
                    <rect x="28" y="19" width="10" height="2" fill="white" opacity="0.6" transform="rotate(25 28 20)"/>
                    <rect x="28" y="27" width="10" height="2" fill="white" opacity="0.6" transform="rotate(-25 28 28)"/>
                    {/* 箭头尖端 - 终点的聚焦 */}
                    <circle cx="36" cy="24" r="2" fill="white" opacity="0.9"/>
                  </svg>
                </div>
              </div>
              
              {/* 文字标签 */}
              <p className="mt-6 text-lg font-normal text-gray-200 text-center">
                将你模糊的想法变具体
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 呼吸灯效果 */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        .group:hover > div:first-child {
          animation: breathe 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}