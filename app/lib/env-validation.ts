// Environment variable validation and type safety

interface EnvConfig {
  GOOGLE_API_KEY?: string
  OPENROUTER_API_KEY?: string
  API_PROVIDER: 'google' | 'openrouter'
  NODE_ENV: 'development' | 'production' | 'test'
  MODEL_NAME?: string
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvironmentError'
  }
}

function validateEnvVar(name: string, value: string | undefined, required: boolean = true): string {
  if (!value && required) {
    throw new EnvironmentError(`Missing required environment variable: ${name}`)
  }
  return value || ''
}

function getEnvConfig(): EnvConfig {
  // Only validate on server side
  if (typeof window !== 'undefined') {
    throw new Error('Environment variables should only be accessed on the server')
  }
  
  const provider = (process.env.API_PROVIDER || 'google') as EnvConfig['API_PROVIDER']
  
  const config: EnvConfig = {
    API_PROVIDER: provider,
    NODE_ENV: (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV'],
    MODEL_NAME: process.env.MODEL_NAME || 'anthropic/claude-opus-4',
  }
  
  // Validate API provider
  if (!['google', 'openrouter'].includes(config.API_PROVIDER)) {
    throw new EnvironmentError(`Invalid API_PROVIDER: ${config.API_PROVIDER}. Must be 'google' or 'openrouter'`)
  }
  
  // Validate appropriate API key based on provider
  if (config.API_PROVIDER === 'google') {
    config.GOOGLE_API_KEY = validateEnvVar('GOOGLE_API_KEY', process.env.GOOGLE_API_KEY)
    if (!config.GOOGLE_API_KEY.startsWith('AIza')) {
      console.warn('Google API key format may be incorrect')
    }
  } else if (config.API_PROVIDER === 'openrouter') {
    config.OPENROUTER_API_KEY = validateEnvVar('OPENROUTER_API_KEY', process.env.OPENROUTER_API_KEY)
  }
  
  return config
}

// Cached config to avoid repeated validation
let cachedConfig: EnvConfig | null = null

export function getEnv(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = getEnvConfig()
  }
  return cachedConfig
}

// Helper functions for specific env vars
export function getGoogleApiKey(): string {
  const env = getEnv()
  if (!env.GOOGLE_API_KEY) {
    throw new EnvironmentError('Google API key not configured')
  }
  return env.GOOGLE_API_KEY
}

export function getOpenRouterApiKey(): string {
  const env = getEnv()
  if (!env.OPENROUTER_API_KEY) {
    throw new EnvironmentError('OpenRouter API key not configured')
  }
  return env.OPENROUTER_API_KEY
}

export function getApiProvider(): 'google' | 'openrouter' {
  return getEnv().API_PROVIDER
}

export function getModelName(): string {
  return getEnv().MODEL_NAME || 'anthropic/claude-opus-4'
}

export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development'
}

export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production'
}

// Log environment info (without exposing sensitive data)
export function logEnvInfo(): void {
  const env = getEnv()
  const apiKey = env.API_PROVIDER === 'google' ? env.GOOGLE_API_KEY : env.OPENROUTER_API_KEY
  console.log('Environment Configuration:', {
    provider: env.API_PROVIDER,
    model: env.MODEL_NAME,
    environment: env.NODE_ENV,
    apiKeyConfigured: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
  })
}