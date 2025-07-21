/**
 * 直接测试 API 响应
 */

const https = require('https')

function testAPI() {
  const data = JSON.stringify({
    action: 'optimize',
    prompt: '我想写一个针对整理周报的提示词'
  })

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/optimize/v2',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    },
    rejectUnauthorized: false
  }

  const req = require('http').request(options, (res) => {
    console.log(`Status: ${res.statusCode}`)
    console.log(`Headers: ${JSON.stringify(res.headers)}`)
    
    let responseData = ''
    
    res.on('data', (chunk) => {
      responseData += chunk
    })
    
    res.on('end', () => {
      try {
        const result = JSON.parse(responseData)
        console.log('\n=== API 响应 ===')
        console.log(JSON.stringify(result, null, 2))
        
        if (result.fallback) {
          console.log('\n注意：API 使用了后备模板，可能是因为：')
          console.log('1. OpenRouter API 调用失败')
          console.log('2. API 密钥无效或额度不足')
          console.log('3. 模型不可用')
        }
      } catch (e) {
        console.error('解析响应失败:', e)
        console.log('原始响应:', responseData)
      }
    })
  })

  req.on('error', (e) => {
    console.error(`请求失败: ${e.message}`)
  })

  req.write(data)
  req.end()
}

console.log('测试 API 直接调用...')
console.log('API 端点: http://localhost:3002/api/optimize/v2')
console.log('请求方法: POST')
console.log('---')

testAPI()