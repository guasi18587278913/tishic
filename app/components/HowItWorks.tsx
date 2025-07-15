'use client'

const steps = [
  {
    number: '01',
    title: '输入想法',
    description: '输入你的初始提示词或想法',
    icon: 'fa-keyboard',
  },
  {
    number: '02',
    title: '智能分析',
    description: 'AI分析并提出关键问题',
    icon: 'fa-brain',
  },
  {
    number: '03',
    title: '深度优化',
    description: '基于六维度框架优化提示词',
    icon: 'fa-magic',
  },
  {
    number: '04',
    title: '获得结果',
    description: '获得专业的优化提示词',
    icon: 'fa-check-circle',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient-blue">如何工作</span>
          </h2>
          <p className="text-xl text-gray-400">四步实现提示词的完美蜕变</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-gray-700 to-transparent" />
              )}
              
              <div className="glass-dark rounded-2xl p-8 text-center relative group hover:transform hover:scale-105 transition-all duration-300">
                {/* Icon with integrated step number */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center group-hover:from-teal-900 group-hover:to-emerald-900 transition-all duration-300">
                    <i className={`fas ${step.icon} text-3xl text-gray-400 group-hover:text-white transition-colors duration-300`}></i>
                  </div>
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-xs font-bold shadow-lg">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}