'use client'

import { useState, useEffect } from 'react'

export default function WechatTip() {
  const [isWechat, setIsWechat] = useState(false)
  const [showTip, setShowTip] = useState(true)

  useEffect(() => {
    // 检测是否在微信浏览器中
    const ua = navigator.userAgent.toLowerCase()
    if (ua.match(/MicroMessenger/i)) {
      setIsWechat(true)
    }
  }, [])

  if (!isWechat || !showTip) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg p-6 mx-4 max-w-sm">
        <h3 className="text-lg font-bold mb-4 text-gray-900">请在浏览器中打开</h3>
        <p className="text-gray-700 mb-4">
          微信内置浏览器可能无法正常访问本站。请点击右上角菜单，选择"在浏览器打开"。
        </p>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. 点击右上角 ⋯ 菜单</p>
          <p>2. 选择"在浏览器打开"</p>
          <p>3. 推荐使用 Safari 或 Chrome</p>
        </div>
        <button
          onClick={() => setShowTip(false)}
          className="mt-6 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          我知道了
        </button>
      </div>
    </div>
  )
}