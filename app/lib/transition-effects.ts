// 页面过渡效果配置

export type TransitionEffect = 'fade' | 'slide' | 'scale' | 'flip' | 'rotate' | 'blur'

export interface TransitionConfig {
  name: string
  className: string
  duration: number
  description: string
}

export const transitionEffects: Record<TransitionEffect, TransitionConfig> = {
  fade: {
    name: '淡入淡出',
    className: 'transition-fade',
    duration: 500,
    description: '经典的透明度过渡'
  },
  slide: {
    name: '滑动',
    className: 'transition-slide',
    duration: 600,
    description: '从侧边滑入'
  },
  scale: {
    name: '缩放',
    className: 'transition-scale',
    duration: 500,
    description: '放大缩小效果'
  },
  flip: {
    name: '翻转',
    className: 'transition-flip',
    duration: 700,
    description: '3D翻转效果'
  },
  rotate: {
    name: '旋转',
    className: 'transition-rotate',
    duration: 600,
    description: '旋转进入'
  },
  blur: {
    name: '模糊',
    className: 'transition-blur',
    duration: 500,
    description: '模糊到清晰'
  }
}

// 获取用户偏好的过渡效果
export function getUserTransitionPreference(): TransitionEffect {
  if (typeof window === 'undefined') return 'fade'
  
  const saved = localStorage.getItem('transition-effect')
  return (saved as TransitionEffect) || 'fade'
}

// 保存用户偏好
export function saveUserTransitionPreference(effect: TransitionEffect) {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('transition-effect', effect)
}