/**
 * 测试提示词优化功能
 */

async function testOptimization() {
  const testPrompt = '我想写一个针对整理周报的提示词'
  
  console.log('=== 测试提示词优化 V2 ===')
  console.log('输入提示词:', testPrompt)
  console.log('使用模型: Claude Opus 4')
  console.log('---')
  
  try {
    // 测试分析功能
    console.log('1. 测试任务分析...')
    const analyzeResponse = await fetch('http://localhost:3002/api/optimize/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze',
        prompt: testPrompt
      })
    })
    
    const analyzeResult = await analyzeResponse.json()
    console.log('任务类型:', analyzeResult.analysis?.taskType)
    console.log('用户意图:', analyzeResult.analysis?.intent)
    console.log('置信度:', analyzeResult.analysis?.confidence)
    console.log('---')
    
    // 测试优化功能
    console.log('2. 测试提示词优化...')
    const optimizeResponse = await fetch('http://localhost:3002/api/optimize/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'optimize',
        prompt: testPrompt
      })
    })
    
    const optimizeResult = await optimizeResponse.json()
    
    if (optimizeResult.error) {
      console.error('优化失败:', optimizeResult.error)
      return
    }
    
    console.log('\n=== 优化结果 ===')
    console.log(optimizeResult.optimizedPrompt)
    console.log('\n=== 质量评分 ===')
    if (optimizeResult.quality) {
      console.log('分数:', optimizeResult.quality.score + '/100')
      if (optimizeResult.quality.issues?.length > 0) {
        console.log('发现的问题:')
        optimizeResult.quality.issues.forEach(issue => {
          console.log('  -', issue)
        })
      }
    }
    
    console.log('\n=== 改进建议 ===')
    if (optimizeResult.suggestions) {
      optimizeResult.suggestions.forEach(suggestion => {
        console.log('  -', suggestion)
      })
    }
    
    // 对比测试：创作类提示词
    console.log('\n\n=== 对比测试：创作类提示词 ===')
    const creativePrompt = '写一个关于友谊的故事'
    console.log('输入:', creativePrompt)
    
    const creativeResponse = await fetch('http://localhost:3002/api/optimize/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'optimize',
        prompt: creativePrompt
      })
    })
    
    const creativeResult = await creativeResponse.json()
    console.log('\n优化结果预览:')
    console.log(creativeResult.optimizedPrompt.substring(0, 300) + '...')
    
  } catch (error) {
    console.error('测试失败:', error)
    console.log('\n请确保：')
    console.log('1. 开发服务器正在运行 (npm run dev)')
    console.log('2. 环境变量配置正确')
    console.log('3. API 密钥有效')
  }
}

// 运行测试
testOptimization()