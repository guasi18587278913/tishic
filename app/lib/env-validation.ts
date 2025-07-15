// Environment variable validation and type safety

interface EnvConfig {
  GOOGLE_API_KEY: string
  API_PROVIDER: 'google' | 'openrouter'
  NODE_ENV: 'development' | 'production' | 'test'
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
  
  const config: EnvConfig = {
    GOOGLE_API_KEY: validateEnvVar('GOOGLE_API_KEY', process.env.GOOGLE_API_KEY),
    API_PROVIDER: (process.env.API_PROVIDER || 'google') as EnvConfig['API_PROVIDER'],
    NODE_ENV: (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV'],
  }
  
  // Validate API provider
  if (!['google', 'openrouter'].includes(config.API_PROVIDER)) {
    throw new EnvironmentError(`Invalid API_PROVIDER: ${config.API_PROVIDER}. Must be 'google' or 'openrouter'`)
  }
  
  // Validate API key format (basic check)
  if (config.API_PROVIDER === 'google' && !config.GOOGLE_API_KEY.startsWith('AIza')) {
    console.warn('Google API key format may be incorrect')
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
  return getEnv().GOOGLE_API_KEY
}

export function getApiProvider(): 'google' | 'openrouter' {
  return getEnv().API_PROVIDER
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
  console.log('Environment Configuration:', {
    provider: env.API_PROVIDER,
    environment: env.NODE_ENV,
    apiKeyConfigured: !!env.GOOGLE_API_KEY,
    apiKeyLength: env.GOOGLE_API_KEY.length,
  })
}