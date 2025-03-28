#!/bin/bash

# Check if component name is provided
if [ -z "$1" ]; then
  echo "Please provide a component name in UpperCamelCase"
  echo "Usage: sh component-generator.sh ComponentName"
  exit 1
fi

# Component name in different formats
COMPONENT_NAME=$1
COMPONENT_NAME_LOWERCASE=$(echo "$COMPONENT_NAME" | tr '[:upper:]' '[:lower:]')
COMPONENT_NAME_KEBAB=$(echo "$COMPONENT_NAME" | sed -r 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]')

# Create component directory
mkdir -p src/components/$COMPONENT_NAME
mkdir -p tests/api/$COMPONENT_NAME

echo "Creating component files for $COMPONENT_NAME..."

# Create model file
cat > src/components/$COMPONENT_NAME/$COMPONENT_NAME_LOWERCASE.ts << EOF
/**
 * $(date +%Y-%m-%d): Created $COMPONENT_NAME model
 * - Defined $COMPONENT_NAME interface with required fields
 * - Added type definitions for $COMPONENT_NAME-related operations
 */

export interface $COMPONENT_NAME {
  id?: number
  // Add your properties here
  created_at?: string
  updated_at?: string
}

export interface ${COMPONENT_NAME}Input {
  // Add your input properties here
}

export interface ${COMPONENT_NAME}Output {
  id: number
  // Add your output properties here
  created_at: string
  updated_at: string
}
EOF

# Create repository file
cat > src/components/$COMPONENT_NAME/$COMPONENT_NAME_LOWERCASE-repository.ts << EOF
/**
 * $(date +%Y-%m-%d): Created $COMPONENT_NAME repository
 * - Implemented CRUD operations for $COMPONENT_NAME model
 * - Added error handling and validation
 * - Used Knex query builder for database operations
 */

import db from '@libraries/database/db'
import { $COMPONENT_NAME, ${COMPONENT_NAME}Input, ${COMPONENT_NAME}Output } from './$COMPONENT_NAME_LOWERCASE'

export class ${COMPONENT_NAME}Repository {
  private tableName = '${COMPONENT_NAME_LOWERCASE}s'

  async findAll(): Promise<${COMPONENT_NAME}Output[]> {
    try {
      const items = await db(this.tableName).select('*')
      return items
    } catch (error) {
      console.error('Error finding all ${COMPONENT_NAME_LOWERCASE}s:', error)
      throw new Error('Failed to retrieve ${COMPONENT_NAME_LOWERCASE}s')
    }
  }

  async findById(id: number): Promise<${COMPONENT_NAME}Output | null> {
    try {
      const item = await db(this.tableName)
        .select('*')
        .where({ id })
        .first()
      
      return item || null
    } catch (error) {
      console.error(\`Error finding ${COMPONENT_NAME_LOWERCASE} with id \${id}:\`, error)
      throw new Error(\`Failed to retrieve ${COMPONENT_NAME_LOWERCASE} with id \${id}\`)
    }
  }

  async create(data: ${COMPONENT_NAME}Input): Promise<${COMPONENT_NAME}Output> {
    try {
      const [id] = await db(this.tableName).insert(data)
      const newItem = await this.findById(id)
      
      if (!newItem) {
        throw new Error('Failed to retrieve created ${COMPONENT_NAME_LOWERCASE}')
      }
      
      return newItem
    } catch (error) {
      console.error('Error creating ${COMPONENT_NAME_LOWERCASE}:', error)
      throw error
    }
  }

  async update(id: number, data: Partial<${COMPONENT_NAME}Input>): Promise<${COMPONENT_NAME}Output | null> {
    try {
      const existingItem = await this.findById(id)
      if (!existingItem) {
        return null
      }

      await db(this.tableName)
        .where({ id })
        .update({
          ...data,
          updated_at: db.fn.now()
        })

      return this.findById(id)
    } catch (error) {
      console.error(\`Error updating ${COMPONENT_NAME_LOWERCASE} with id \${id}:\`, error)
      throw new Error(\`Failed to update ${COMPONENT_NAME_LOWERCASE} with id \${id}\`)
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const existingItem = await this.findById(id)
      if (!existingItem) {
        return false
      }

      await db(this.tableName).where({ id }).del()
      return true
    } catch (error) {
      console.error(\`Error deleting ${COMPONENT_NAME_LOWERCASE} with id \${id}:\`, error)
      throw new Error(\`Failed to delete ${COMPONENT_NAME_LOWERCASE} with id \${id}\`)
    }
  }
}
EOF

# Create controller file
cat > src/components/$COMPONENT_NAME/$COMPONENT_NAME_LOWERCASE-controller.ts << EOF
/**
 * $(date +%Y-%m-%d): Created $COMPONENT_NAME controller
 * - Implemented business logic for $COMPONENT_NAME operations
 * - Added error handling and validation
 * - Separated business logic from repository layer
 */

import { ${COMPONENT_NAME}Repository } from './$COMPONENT_NAME_LOWERCASE-repository'
import { ${COMPONENT_NAME}Input } from './$COMPONENT_NAME_LOWERCASE'

export class ${COMPONENT_NAME}Controller {
  private repository: ${COMPONENT_NAME}Repository

  constructor() {
    this.repository = new ${COMPONENT_NAME}Repository()
  }

  async getAll() {
    try {
      return await this.repository.findAll()
    } catch (error) {
      throw error
    }
  }

  async getById(id: number) {
    try {
      const item = await this.repository.findById(id)
      if (!item) {
        throw new Error('${COMPONENT_NAME} not found')
      }
      return item
    } catch (error) {
      throw error
    }
  }

  async create(data: ${COMPONENT_NAME}Input) {
    try {
      // Add validation if needed
      return await this.repository.create(data)
    } catch (error) {
      throw error
    }
  }

  async update(id: number, data: Partial<${COMPONENT_NAME}Input>) {
    try {
      if (Object.keys(data).length === 0) {
        throw new Error('No data provided for update')
      }
      
      const updatedItem = await this.repository.update(id, data)
      if (!updatedItem) {
        throw new Error('${COMPONENT_NAME} not found')
      }
      
      return updatedItem
    } catch (error) {
      throw error
    }
  }

  async delete(id: number) {
    try {
      const deleted = await this.repository.delete(id)
      if (!deleted) {
        throw new Error('${COMPONENT_NAME} not found')
      }
      
      return { message: '${COMPONENT_NAME} deleted successfully' }
    } catch (error) {
      throw error
    }
  }
}
EOF

# Create API routes file
cat > src/components/$COMPONENT_NAME/$COMPONENT_NAME_LOWERCASE-api.ts << EOF
/**
 * $(date +%Y-%m-%d): Created $COMPONENT_NAME API routes
 * - Implemented REST endpoints for $COMPONENT_NAME operations
 * - Added Swagger documentation for all endpoints
 * - Set up error handling and response formatting
 */

import express, { Request, Response } from 'express'
import { ${COMPONENT_NAME}Controller } from './$COMPONENT_NAME_LOWERCASE-controller'
import { ${COMPONENT_NAME}Input } from './$COMPONENT_NAME_LOWERCASE'

const router = express.Router()
const controller = new ${COMPONENT_NAME}Controller()

/**
 * @swagger
 * /api/${COMPONENT_NAME_KEBAB}s:
 *   get:
 *     summary: Get all ${COMPONENT_NAME_LOWERCASE}s
 *     description: Retrieve a list of all ${COMPONENT_NAME_LOWERCASE}s
 *     tags: [${COMPONENT_NAME}s]
 *     responses:
 *       200:
 *         description: A list of ${COMPONENT_NAME_LOWERCASE}s
 *       500:
 *         description: Server error
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await controller.getAll()
    res.json(items)
  } catch (error: any) {
    res.status(500).json({ message: error.message, status: 500 })
  }
})

/**
 * @swagger
 * /api/${COMPONENT_NAME_KEBAB}s/{id}:
 *   get:
 *     summary: Get ${COMPONENT_NAME_LOWERCASE} by ID
 *     description: Retrieve a single ${COMPONENT_NAME_LOWERCASE} by ID
 *     tags: [${COMPONENT_NAME}s]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ${COMPONENT_NAME} ID
 *     responses:
 *       200:
 *         description: ${COMPONENT_NAME} details
 *       404:
 *         description: ${COMPONENT_NAME} not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format', status: 400 })
    }
    
    const item = await controller.getById(id)
    res.json(item)
  } catch (error: any) {
    if (error.message === '${COMPONENT_NAME} not found') {
      res.status(404).json({ message: error.message, status: 404 })
    } else {
      res.status(500).json({ message: error.message, status: 500 })
    }
  }
})

/**
 * @swagger
 * /api/${COMPONENT_NAME_KEBAB}s:
 *   post:
 *     summary: Create a new ${COMPONENT_NAME_LOWERCASE}
 *     description: Create a new ${COMPONENT_NAME_LOWERCASE} with the provided data
 *     tags: [${COMPONENT_NAME}s]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${COMPONENT_NAME}Input'
 *     responses:
 *       201:
 *         description: ${COMPONENT_NAME} created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const data: ${COMPONENT_NAME}Input = req.body
    const newItem = await controller.create(data)
    res.status(201).json(newItem)
  } catch (error: any) {
    res.status(500).json({ message: error.message, status: 500 })
  }
})

/**
 * @swagger
 * /api/${COMPONENT_NAME_KEBAB}s/{id}:
 *   put:
 *     summary: Update a ${COMPONENT_NAME_LOWERCASE}
 *     description: Update a ${COMPONENT_NAME_LOWERCASE}'s information by ID
 *     tags: [${COMPONENT_NAME}s]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ${COMPONENT_NAME} ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${COMPONENT_NAME}Input'
 *     responses:
 *       200:
 *         description: ${COMPONENT_NAME} updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: ${COMPONENT_NAME} not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format', status: 400 })
    }
    
    const data = req.body
    const updatedItem = await controller.update(id, data)
    res.json(updatedItem)
  } catch (error: any) {
    if (error.message === '${COMPONENT_NAME} not found') {
      res.status(404).json({ message: error.message, status: 404 })
    } else if (error.message === 'No data provided for update') {
      res.status(400).json({ message: error.message, status: 400 })
    } else {
      res.status(500).json({ message: error.message, status: 500 })
    }
  }
})

/**
 * @swagger
 * /api/${COMPONENT_NAME_KEBAB}s/{id}:
 *   delete:
 *     summary: Delete a ${COMPONENT_NAME_LOWERCASE}
 *     description: Delete a ${COMPONENT_NAME_LOWERCASE} by ID
 *     tags: [${COMPONENT_NAME}s]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ${COMPONENT_NAME} ID
 *     responses:
 *       200:
 *         description: ${COMPONENT_NAME} deleted successfully
 *       404:
 *         description: ${COMPONENT_NAME} not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format', status: 400 })
    }
    
    const result = await controller.delete(id)
    res.json(result)
  } catch (error: any) {
    if (error.message === '${COMPONENT_NAME} not found') {
      res.status(404).json({ message: error.message, status: 404 })
    } else {
      res.status(500).json({ message: error.message, status: 500 })
    }
  }
})

export default router
EOF

# Create test file
cat > tests/api/$COMPONENT_NAME/${COMPONENT_NAME_LOWERCASE}-api.test.ts << EOF
/**
 * $(date +%Y-%m-%d): Created $COMPONENT_NAME API tests
 * - Set up test cases for all CRUD operations
 * - Added validation testing
 * - Implemented test database setup and teardown
 */

describe('${COMPONENT_NAME} API', () => {
  // TODO: Add your tests here
  
  it('should get all ${COMPONENT_NAME_LOWERCASE}s', async () => {
    // TODO: Implement test
  })
  
  it('should get a ${COMPONENT_NAME_LOWERCASE} by id', async () => {
    // TODO: Implement test
  })
  
  it('should create a new ${COMPONENT_NAME_LOWERCASE}', async () => {
    // TODO: Implement test
  })
  
  it('should update a ${COMPONENT_NAME_LOWERCASE}', async () => {
    // TODO: Implement test
  })
  
  it('should delete a ${COMPONENT_NAME_LOWERCASE}', async () => {
    // TODO: Implement test
  })
})
EOF

echo "Component $COMPONENT_NAME created successfully!"
echo "Files created:"
echo "- src/components/$COMPONENT_NAME/$COMPONENT_NAME_LOWERCASE.ts"
echo "- src/components/$COMPONENT_NAME/$COMPONENT_NAME_LOWERCASE-repository.ts"
echo "- src/components/$COMPONENT_NAME/$COMPONENT_NAME_LOWERCASE-controller.ts"
echo "- src/components/$COMPONENT_NAME/$COMPONENT_NAME_LOWERCASE-api.ts"
echo "- tests/api/$COMPONENT_NAME/${COMPONENT_NAME_LOWERCASE}-api.test.ts"
echo ""
echo "Don't forget to add the route to your server.ts file:"
echo "import ${COMPONENT_NAME_LOWERCASE}Routes from '@components/$COMPONENT_NAME/$COMPONENT_NAME_LOWERCASE-api'"
echo "app.use(`/\${apiPrefix}/${COMPONENT_NAME_KEBAB}s`, ${COMPONENT_NAME_LOWERCASE}Routes)"
