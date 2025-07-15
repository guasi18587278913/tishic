// Service Worker - 实现智能缓存策略

const CACHE_NAME = 'prompt-optimizer-v1'
const API_CACHE_NAME = 'api-cache-v1'

// 需要缓存的静态资源
const STATIC_RESOURCES = [
  '/',
  '/globals.css',
  '/manifest.json',
]

// API缓存配置
const API_CACHE_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24小时
  maxEntries: 50,
}

// 安装Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_RESOURCES)
    })
  )
  
  // 立即激活
  self.skipWaiting()
})

// 激活Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated')
  
  event.waitUntil(
    // 清理旧缓存
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  
  // 立即控制所有页面
  self.clients.claim()
})

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API请求的智能缓存
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request))
    return
  }

  // 静态资源缓存优先
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // 后台更新缓存
        fetchAndCache(request)
        return cachedResponse
      }
      
      return fetchAndCache(request)
    })
  )
})

// 处理API请求
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME)
  
  // 对于预热请求，总是从网络获取
  if (request.headers.get('X-Warmup-Request') === 'true') {
    return fetch(request)
  }
  
  // 尝试从缓存获取
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    const cacheTime = new Date(cachedResponse.headers.get('date')).getTime()
    const now = Date.now()
    
    // 检查缓存是否过期
    if (now - cacheTime < API_CACHE_CONFIG.maxAge) {
      // 返回缓存，但在后台更新
      fetchAndUpdateAPICache(request, cache)
      return cachedResponse
    }
  }
  
  // 从网络获取
  try {
    const networkResponse = await fetch(request)
    
    // 只缓存成功的响应
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // 网络失败时返回缓存（如果有）
    if (cachedResponse) {
      return cachedResponse
    }
    
    // 返回离线响应
    return new Response(
      JSON.stringify({ error: '网络连接失败，请检查网络' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// 获取并缓存
async function fetchAndCache(request) {
  try {
    const response = await fetch(request)
    
    // 只缓存成功的响应
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // 尝试返回缓存
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

// 后台更新API缓存
async function fetchAndUpdateAPICache(request, cache) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response)
    }
  } catch (error) {
    // 静默失败
    console.debug('Background cache update failed:', error)
  }
}

// 监听消息
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(API_CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
})