import { NextResponse } from 'next/server'

// Error response utilities

export interface ErrorResponse {
  error: {
    message: string
    code?: string
    status: number
    timestamp: string
    requestId?: string
    details?: any
  }
}

export class ApiError extends Error {
  public status: number
  public code?: string
  public details?: any
  
  constructor(message: string, status: number, code?: string, details?: any) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
    this.name = 'ApiError'
  }
}

// Common API errors
export const ApiErrors = {
  BAD_REQUEST: (message: string, details?: any) => 
    new ApiError(message, 400, 'BAD_REQUEST', details),
    
  UNAUTHORIZED: (message: string = 'Unauthorized') => 
    new ApiError(message, 401, 'UNAUTHORIZED'),
    
  FORBIDDEN: (message: string = 'Forbidden') => 
    new ApiError(message, 403, 'FORBIDDEN'),
    
  NOT_FOUND: (message: string = 'Not found') => 
    new ApiError(message, 404, 'NOT_FOUND'),
    
  RATE_LIMITED: (message: string = 'Too many requests') => 
    new ApiError(message, 429, 'RATE_LIMITED'),
    
  INTERNAL_ERROR: (message: string = 'Internal server error', details?: any) => 
    new ApiError(message, 500, 'INTERNAL_ERROR', details),
    
  SERVICE_UNAVAILABLE: (message: string = 'Service unavailable') => 
    new ApiError(message, 503, 'SERVICE_UNAVAILABLE'),
}

// Error response factory
export function createErrorResponse(
  error: Error | ApiError | unknown,
  requestId?: string
): NextResponse<ErrorResponse> {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const timestamp = new Date().toISOString()
  
  // Handle known ApiError instances
  if (error instanceof ApiError) {
    return NextResponse.json<ErrorResponse>(
      {
        error: {
          message: error.message,
          code: error.code,
          status: error.status,
          timestamp,
          requestId,
          ...(isDevelopment && error.details && { details: error.details })
        }
      },
      { status: error.status }
    )
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    console.error('Unhandled error:', error)
    
    return NextResponse.json<ErrorResponse>(
      {
        error: {
          message: isDevelopment ? error.message : 'An unexpected error occurred',
          status: 500,
          timestamp,
          requestId,
          ...(isDevelopment && { 
            details: {
              name: error.name,
              stack: error.stack
            }
          })
        }
      },
      { status: 500 }
    )
  }
  
  // Handle unknown errors
  console.error('Unknown error:', error)
  
  return NextResponse.json<ErrorResponse>(
    {
      error: {
        message: 'An unexpected error occurred',
        status: 500,
        timestamp,
        requestId,
        ...(isDevelopment && { details: error })
      }
    },
    { status: 500 }
  )
}

// Request ID generator
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Logging utility
export function logApiError(
  error: Error | unknown,
  context: {
    requestId?: string
    method?: string
    path?: string
    userId?: string
    [key: string]: any
  }
): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    ...context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error
  }
  
  console.error('API Error:', JSON.stringify(errorInfo, null, 2))
}