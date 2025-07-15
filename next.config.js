/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 优化构建输出
  swcMinify: true,
  
  // 图片优化
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // 实验性功能
  experimental: {
    // 优化包大小
    optimizeCss: true,
    // 启用服务端组件优化
    serverComponentsExternalPackages: ['framer-motion'],
  },
  
  // Webpack 配置
  webpack: (config, { isServer }) => {
    // 优化客户端包大小
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // 将大型库分离到单独的块
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-sync-external-store)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test(module) {
              return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier())
            },
            name(module) {
              const hash = require('crypto').createHash('sha1')
              hash.update(module.identifier())
              return hash.digest('hex').substring(0, 8)
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name(module, chunks) {
              return 'shared-' + 
                require('crypto')
                  .createHash('sha1')
                  .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                  .digest('hex')
                  .substring(0, 8)
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      }
    }
    
    return config
  },
}

module.exports = nextConfig