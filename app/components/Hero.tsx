'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  useEffect(() => {
    const initCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = []

      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
        })
      }

      function animate() {
        if (!ctx || !canvas) return
        
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        particles.forEach((particle) => {
          particle.x += particle.vx
          particle.y += particle.vy

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '13, 148, 136' : '16, 185, 129'}, ${0.3 + Math.random() * 0.4})`
          ctx.fill()
        })

        requestAnimationFrame(animate)
      }

      animate()

      const handleResize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }

    // 延迟初始化，确保 DOM 准备就绪
    const timer = setTimeout(initCanvas, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 gradient-hero rounded-full filter blur-[128px] opacity-30 animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full filter blur-[128px] opacity-30 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] gradient-accent rounded-full filter blur-[200px] opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-7xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold mb-6">
          <span className="text-gradient">提示词</span>
          <span className="text-white">优化助手</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
          The Most Powerful <span className="text-gradient-blue">AI Prompt</span> Optimizer
        </p>
        
        <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
          将你模糊的想法转化为精准的AI指令，让每一次对话都能获得理想的结果
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/optimizer"
            className="px-8 py-4 gradient-button-primary rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 relative overflow-hidden group inline-block"
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            <span className="relative flex items-center">
              <i className="fas fa-rocket mr-2"></i>
              立即体验
            </span>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center group cursor-pointer">
            <div className="text-4xl font-bold text-gradient-success mb-2 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">98%</div>
            <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">提升效果</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-4xl font-bold text-gradient-info mb-2 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">10K+</div>
            <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">优化案例</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-4xl font-bold text-gradient-warning mb-2 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">6D</div>
            <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">优化维度</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <i className="fas fa-chevron-down text-2xl text-gray-400"></i>
      </div>
    </section>
  )
}