// 常用提示词预加载服务

import { enhancedCache } from './enhanced-cache'
import { analyzePromptType, generateQuestions, buildOptimizationPrompt } from './prompt-optimizer'

interface PreloadPrompt {
  prompt: string
  type: string
  commonAnswers: Record<string, string>
}

class PromptPreloader {
  // 常用提示词模板
  private commonPrompts: PreloadPrompt[] = [
    {
      prompt: '写一篇关于人工智能的文章',
      type: 'creative',
      commonAnswers: {
        '1': '深入浅出，让普通读者也能理解',
        '2': '避免技术术语堆砌',
        '3': '希望有实际案例'
      }
    },
    {
      prompt: '帮我分析这个数据',
      type: 'analytical',
      commonAnswers: {
        '1': '找出关键趋势和异常',
        '2': '避免过度解读',
        '3': '用图表直观展示'
      }
    },
    {
      prompt: '优化这段代码',
      type: 'technical',
      commonAnswers: {
        '1': '提高性能和可读性',
        '2': '避免过度优化',
        '3': '遵循最佳实践'
      }
    }
  ]

  private preloadQueue: Array<() => Promise<void>> = []
  private isPreloading = false

  // 开始预加载
  async startPreloading() {
    if (this.isPreloading) return
    
    this.isPreloading = true
    console.log('Starting prompt preloading...')

    // 使用 requestIdleCallback 在空闲时预加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.processPreloadQueue(), { timeout: 3000 })
    } else {
      // 降级方案：延迟执行
      setTimeout(() => this.processPreloadQueue(), 2000)
    }
  }

  private async processPreloadQueue() {
    for (const prompt of this.commonPrompts) {
      // 检查缓存中是否已存在
      const cached = enhancedCache.get(prompt.prompt, prompt.commonAnswers)
      if (cached) continue

      // 预生成优化提示词
      this.preloadQueue.push(async () => {
        try {
          const promptType = analyzePromptType(prompt.prompt)
          const questions = generateQuestions(promptType)
          const optimizationPrompt = buildOptimizationPrompt(
            prompt.prompt,
            promptType,
            prompt.commonAnswers
          )

          // 这里可以选择性地调用 API 或仅准备数据
          console.debug(`Preloaded prompt template: ${prompt.prompt.substring(0, 20)}...`)
        } catch (error) {
          console.debug('Preload failed:', error)
        }
      })
    }

    // 批量执行预加载任务
    await this.executeBatch()
  }

  private async executeBatch() {
    const batchSize = 2
    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, batchSize)
      await Promise.all(batch.map(task => task()))
      
      // 避免阻塞主线程
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // 预测用户可能的输入
  predictUserInput(currentInput: string) {
    // 基于当前输入预测可能的完整提示词
    const predictions = this.commonPrompts
      .filter(p => p.prompt.includes(currentInput) || currentInput.includes(p.prompt.substring(0, 10)))
      .slice(0, 3)

    // 预加载预测的提示词
    predictions.forEach(prediction => {
      const cached = enhancedCache.get(prediction.prompt, prediction.commonAnswers)
      if (!cached) {
        // 添加到预加载队列
        this.preloadQueue.push(async () => {
          console.debug(`Predictive preloading: ${prediction.prompt}`)
        })
      }
    })
  }
}

export const promptPreloader = new PromptPreloader()