import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import WechatTip from './components/WechatTip'
import GlobalLoadingIndicator from './components/GlobalLoadingIndicator'
import Script from 'next/script'
import StructuredData from './components/StructuredData'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '提示词优化助手 - AI Prompt Optimizer',
  description: '使用六维度优化框架，将模糊的想法转化为精准的AI提示词',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Framer Motion CDN */}
        <script src="https://unpkg.com/framer-motion@11.0.3/dist/framer-motion.js" defer></script>
        
        {/* Font Awesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        
        {/* 结构化数据 */}
        <StructuredData />
      </head>
      <body className={inter.className}>
        <WechatTip />
        {children}
        <GlobalLoadingIndicator />
        
        {/* Service Worker 注册脚本 */}
        <Script
          id="service-worker-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async () => {
                  try {
                    const registration = await navigator.serviceWorker.register('/service-worker.js');
                    console.log('Service Worker registered:', registration);
                  } catch (error) {
                    console.error('Service Worker registration failed:', error);
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}