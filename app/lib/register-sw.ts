// Service Worker 注册和管理

export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null

  async register() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Worker not supported')
      return
    }

    try {
      // 注册Service Worker
      this.registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      })

      console.log('Service Worker registered successfully')

      // 监听更新
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新版本可用
              console.log('New Service Worker available')
              this.notifyUpdate()
            }
          })
        }
      })

      // 定期检查更新
      setInterval(() => {
        this.registration?.update()
      }, 60 * 60 * 1000) // 每小时检查一次

    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  // 通知用户有更新
  private notifyUpdate() {
    if (confirm('发现新版本，是否立即更新？')) {
      this.skipWaiting()
    }
  }

  // 跳过等待，立即激活新版本
  async skipWaiting() {
    const worker = this.registration?.waiting
    if (worker) {
      worker.postMessage({ type: 'SKIP_WAITING' })
      
      // 重新加载页面
      window.location.reload()
    }
  }

  // 清除API缓存
  async clearAPICache() {
    if (!navigator.serviceWorker.controller) return

    const channel = new MessageChannel()
    
    return new Promise((resolve) => {
      channel.port1.onmessage = (event) => {
        resolve(event.data.success)
      }

      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [channel.port2]
      )
    })
  }

  // 预缓存重要资源
  async precacheResources(urls: string[]) {
    if (!('caches' in window)) return

    try {
      const cache = await caches.open('prompt-optimizer-v1')
      await cache.addAll(urls)
      console.log('Resources precached successfully')
    } catch (error) {
      console.error('Precaching failed:', error)
    }
  }
}

export const swManager = new ServiceWorkerManager()