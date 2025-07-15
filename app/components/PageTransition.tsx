'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionStage, setTransitionStage] = useState('enter')

  useEffect(() => {
    if (children !== displayChildren) {
      setTransitionStage('exit')
      
      setTimeout(() => {
        setDisplayChildren(children)
        setTransitionStage('enter')
      }, 300) // 与exit动画时长匹配
    }
  }, [children, displayChildren])

  return (
    <div className={`page-transition-${transitionStage}`}>
      {displayChildren}
    </div>
  )
}