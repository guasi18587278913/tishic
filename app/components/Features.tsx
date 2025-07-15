'use client'

import Link from 'next/link'

const features = [
  {
    icon: 'fa-brain',
    title: '智能分析',
    titleEn: 'Smart Analysis',
    description: '自动识别提示词类型，深度理解用户意图',
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    icon: 'fa-cube',
    title: '六维优化',
    titleEn: '6D Framework',
    description: '独创六维度框架，全方位提升提示词质量',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: 'fa-bolt',
    title: '实时生成',
    titleEn: 'Real-time',
    description: '流式响应技术，优化结果实时呈现',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: 'fa-shield-alt',
    title: '质量保证',
    titleEn: 'Quality First',
    description: '基于Claude Opus 4，确保最高输出质量',
    gradient: 'from-orange-500 to-red-500',
  },
]

export default function Features() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">核心功能</span>
          </h2>
          <p className="text-xl text-gray-400">让AI真正理解你的需求</p>
        </div>

        <div className="bento-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative glass rounded-2xl p-8 hover:bg-white hover:bg-opacity-10 transition-all duration-300 overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                <i className={`fas ${feature.icon} text-2xl text-white`}></i>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{feature.titleEn}</p>
              <p className="text-gray-300">{feature.description}</p>

              {/* Hover Effect Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold mb-4">
            准备好提升你的AI对话体验了吗？
          </h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            立即开始使用我们的智能优化工具，让每一次与AI的对话都能获得理想的结果
          </p>
          <Link 
            href="/optimizer"
            className="inline-flex items-center gap-2 px-8 py-4 gradient-button-primary rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/25"
          >
            <i className="fas fa-magic"></i>
            开始优化提示词
          </Link>
        </div>
      </div>
    </section>
  )
}