// API 提供商配置
export const API_PROVIDERS = {
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://tishic.netlify.app',
      'X-Title': 'Prompt Optimizer',
    }),
    models: {
      'claude-opus-4': 'anthropic/claude-opus-4',
      'claude-3-opus': 'anthropic/claude-3-opus',
      'claude-3-sonnet': 'anthropic/claude-3-sonnet',
      'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
      'claude-3-haiku': 'anthropic/claude-3-haiku',
      'gpt-4o': 'openai/gpt-4o',
      'gpt-4-turbo': 'openai/gpt-4-turbo',
    }
  },
  
  // 备用：直接使用 Anthropic API
  anthropic: {
    name: 'Anthropic Direct',
    baseUrl: 'https://api.anthropic.com/v1',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
    models: {
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229',
      'claude-3.5-sonnet': 'claude-3-5-sonnet-20241022',
      'claude-3-haiku': 'claude-3-haiku-20240307',
    }
  },
  
  // 备用：使用 OpenAI 兼容的本地服务
  local: {
    name: 'Local API',
    baseUrl: 'http://localhost:8080/v1',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    models: {
      'claude-3-sonnet': 'claude-3-sonnet',
      'gpt-4': 'gpt-4',
    }
  }
}

export function getApiProvider() {
  // 优先使用环境变量中指定的提供商
  const provider = process.env.API_PROVIDER || 'openrouter'
  return API_PROVIDERS[provider as keyof typeof API_PROVIDERS] || API_PROVIDERS.openrouter
}

export function getModelId(modelKey: string): string {
  const provider = getApiProvider()
  return provider.models[modelKey as keyof typeof provider.models] || modelKey
}