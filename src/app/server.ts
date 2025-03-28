/**
 * 2025-03-28: Initial server setup with Express and TypeScript
 * - Created basic server configuration
 * - Added middleware setup
 * - Configured API routes
 * - Set up static file serving
 * - Added Swagger documentation
 * - Added custom request and response logging
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import dotenv from 'dotenv'
import { setupSwagger } from './providers/swagger'
import { requestLogger } from '@libraries/utils/logger'

// Load environment variables
dotenv.config()

// Import routes
import userRoutes from '@components/User/user-api'

// Extend Express Request interface to include request ID
declare global {
  namespace Express {
    interface Request {
      id?: string
    }
  }
}

// Create Express application
const app = express()
const port = process.env.PORT || 3000
const apiPrefix = process.env.API_PREFIX || 'api'

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'cdn.jsdelivr.net', 'unpkg.com', 'cdn.tailwindcss.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'unpkg.com', 'cdn.tailwindcss.com'],
      imgSrc: ["'self'", 'data:', 'images.unsplash.com']
    }
  }
}))

// Custom request and response logging
app.use(requestLogger.request)
app.use(requestLogger.response)

// HTTP request logging (for development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Static files
app.use(express.static(path.join(__dirname, '../../public')))

// API routes
app.use(`/${apiPrefix}/users`, userRoutes)

// Setup Swagger
setupSwagger(app, apiPrefix)

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'))
})

// Error handling middleware (should be after all routes)
app.use(requestLogger.error)

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
  console.log(`API available at http://localhost:${port}/${apiPrefix}`)
  console.log(`Swagger docs available at http://localhost:${port}/${apiPrefix}/docs`)
})

export default app
