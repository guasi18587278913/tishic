import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '智能提示词优化器 - AI Prompt Optimizer',
  description: '使用六维度优化框架，将模糊的想法转化为精准的AI提示词。支持创作、分析、任务、生成等多种场景。',
  keywords: 'AI提示词优化,prompt优化,ChatGPT提示词,Claude提示词,AI对话优化,提示工程',
  openGraph: {
    title: '智能提示词优化器',
    description: '让每一次AI对话都能获得理想的结果',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://your-domain.com/optimizer',
    siteName: '提示词优化助手',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '提示词优化助手',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '智能提示词优化器',
    description: '使用六维度框架优化你的AI提示词',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://your-domain.com/optimizer',
  },
}

export default function OptimizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}