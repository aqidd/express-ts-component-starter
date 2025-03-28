/**
 * 2025-03-28: Created logger utility
 * - Added request and response logging functionality
 * - Implemented color-coded console output for different log levels
 * - Added timestamp and request ID tracking
 */

import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'

// Log levels with colors
const LOG_LEVELS = {
  INFO: '\x1b[36m%s\x1b[0m', // Cyan
  SUCCESS: '\x1b[32m%s\x1b[0m', // Green
  WARNING: '\x1b[33m%s\x1b[0m', // Yellow
  ERROR: '\x1b[31m%s\x1b[0m' // Red
}

// Get status color based on HTTP status code
const getStatusColor = (status: number): string => {
  if (status >= 500) return LOG_LEVELS.ERROR
  if (status >= 400) return LOG_LEVELS.WARNING
  if (status >= 300) return LOG_LEVELS.INFO
  return LOG_LEVELS.SUCCESS
}

// Format timestamp
const getTimestamp = (): string => {
  return new Date().toISOString()
}

// Log request details
export const logRequest = (req: Request, _res: Response, next: NextFunction): void => {
  // Generate request ID if not exists
  req.id = req.id || uuidv4()
  
  const timestamp = getTimestamp()
  const { method, originalUrl, ip } = req
  
  console.log(
    LOG_LEVELS.INFO,
    `[${timestamp}] [REQ] [${req.id}] ${method} ${originalUrl} - IP: ${ip}`
  )
  
  // Log request body if exists and not a GET request
  if (req.body && Object.keys(req.body).length > 0 && method !== 'GET') {
    // Mask sensitive data like passwords
    const sanitizedBody = { ...req.body }
    if (sanitizedBody.password) sanitizedBody.password = '********'
    
    console.log(
      LOG_LEVELS.INFO,
      `[${timestamp}] [REQ-BODY] [${req.id}] ${JSON.stringify(sanitizedBody)}`
    )
  }
  
  next()
}

// Log response details
export const logResponse = (req: Request, res: Response, next: NextFunction): void => {
  // Store original end method
  const originalEnd = res.end
  const startTime = Date.now()
  
  // Override end method to log response
  res.end = function (chunk?: any, encoding?: any): any {
    const responseTime = Date.now() - startTime
    const timestamp = getTimestamp()
    const { method, originalUrl } = req
    const { statusCode } = res
    
    console.log(
      getStatusColor(statusCode),
      `[${timestamp}] [RES] [${req.id}] ${method} ${originalUrl} - Status: ${statusCode} - ${responseTime}ms`
    )
    
    // Call original end method
    return originalEnd.call(this, chunk, encoding)
  }
  
  next()
}

// Log errors
export const logError = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const timestamp = getTimestamp()
  
  console.log(
    LOG_LEVELS.ERROR,
    `[${timestamp}] [ERROR] [${req.id}] ${req.method} ${req.originalUrl} - ${err.message}`
  )
  
  console.error(err.stack)
  
  // Pass to next error handler
  next(err)
}

// Export middleware
export const requestLogger = {
  request: logRequest,
  response: logResponse,
  error: logError
}
