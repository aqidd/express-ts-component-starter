/**
 * 2025-03-28: Created Swagger configuration
 * - Set up OpenAPI 3.0 specifications
 * - Added Swagger UI endpoint
 * - Configured documentation options
 */

import { Express } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

export const setupSwagger = (app: Express, apiPrefix: string): void => {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Express TypeScript Component Starter API',
        version: '1.0.0',
        description: 'API documentation for the Express TypeScript Component Starter',
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        },
        contact: {
          name: 'API Support',
          url: 'https://github.com/yourusername/express-ts-component-starter',
          email: 'your-email@example.com'
        }
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}/${apiPrefix}`,
          description: 'Development server'
        }
      ],
      components: {
        schemas: {
          User: {
            type: 'object',
            required: ['username', 'email', 'password'],
            properties: {
              id: {
                type: 'integer',
                description: 'User ID'
              },
              username: {
                type: 'string',
                description: 'User username'
              },
              email: {
                type: 'string',
                description: 'User email address'
              },
              password: {
                type: 'string',
                description: 'User password (hashed)',
                format: 'password'
              },
              created_at: {
                type: 'string',
                format: 'date-time',
                description: 'Creation timestamp'
              },
              updated_at: {
                type: 'string',
                format: 'date-time',
                description: 'Last update timestamp'
              }
            }
          },
          UserInput: {
            type: 'object',
            required: ['username', 'email', 'password'],
            properties: {
              username: {
                type: 'string',
                description: 'User username'
              },
              email: {
                type: 'string',
                description: 'User email address'
              },
              password: {
                type: 'string',
                description: 'User password',
                format: 'password'
              }
            }
          },
          Error: {
            type: 'object',
            properties: {
              message: {
                type: 'string'
              },
              status: {
                type: 'integer'
              }
            }
          }
        }
      }
    },
    apis: ['./src/components/**/*-api.ts']
  }

  const specs = swaggerJsdoc(options)
  
  app.use(`/${apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Express TypeScript Component Starter API Docs'
  }))
}
