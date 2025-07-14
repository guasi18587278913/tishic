export default function TestPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-6xl font-bold mb-8">
        <span className="text-gradient">测试页面</span>
      </h1>
      
      <div className="space-y-4">
        <div className="p-6 glass rounded-lg">
          <h2 className="text-2xl mb-2">Glass 效果</h2>
          <p>这是一个带有玻璃效果的卡片</p>
        </div>
        
        <div className="p-6 gradient-primary rounded-lg">
          <h2 className="text-2xl mb-2">渐变背景</h2>
          <p>这是一个带有渐变背景的卡片</p>
        </div>
        
        <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <h2 className="text-2xl mb-2">Tailwind 渐变</h2>
          <p>这是使用 Tailwind 渐变的卡片</p>
        </div>
      </div>
    </div>
  )
}