'use client'

export default function Footer() {
  const links = [
    { title: 'GitHub', icon: 'fab fa-github', href: '#' },
    { title: 'Twitter', icon: 'fab fa-twitter', href: '#' },
    { title: 'Discord', icon: 'fab fa-discord', href: '#' },
  ]

  return (
    <footer className="py-12 px-4 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-gradient">提示词</span>优化助手
            </h3>
            <p className="text-gray-400">
              让AI真正理解你的需求
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">快速链接</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">关于我们</a></li>
              <li><a href="#" className="hover:text-white transition-colors">使用文档</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API接入</a></li>
              <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4">关注我们</h4>
            <div className="flex space-x-4">
              {links.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  className="w-12 h-12 rounded-lg glass flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                  title={link.title}
                >
                  <i className={`${link.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 Prompt Optimizer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}