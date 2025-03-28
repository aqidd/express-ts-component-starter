/**
 * 2025-03-28: Created User API routes
 * - Implemented REST endpoints for user operations
 * - Added Swagger documentation for all endpoints
 * - Set up error handling and response formatting
 */

import express, { Request, Response } from 'express'
import { UserController } from './user-controller'
import { UserInput } from './user'

const router = express.Router()
const userController = new UserController()

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await userController.getAllUsers()
    res.json(users)
  } catch (error: any) {
    res.status(500).json({ message: error.message, status: 500 })
  }
})

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a single user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format', status: 400 })
    }
    
    const user = await userController.getUserById(id)
    res.json(user)
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message, status: 404 })
    } else {
      res.status(500).json({ message: error.message, status: 500 })
    }
  }
})

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user with the provided data
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const userData: UserInput = req.body
    const newUser = await userController.createUser(userData)
    res.status(201).json(newUser)
  } catch (error: any) {
    if (error.message.includes('already exists') || 
        error.message.includes('must be at least') || 
        error.message.includes('is required')) {
      res.status(400).json({ message: error.message, status: 400 })
    } else {
      res.status(500).json({ message: error.message, status: 500 })
    }
  }
})

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Update a user's information by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format', status: 400 })
    }
    
    const userData = req.body
    const updatedUser = await userController.updateUser(id, userData)
    res.json(updatedUser)
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message, status: 404 })
    } else if (error.message === 'No data provided for update' || 
              error.message.includes('must be at least') || 
              error.message.includes('is required')) {
      res.status(400).json({ message: error.message, status: 400 })
    } else {
      res.status(500).json({ message: error.message, status: 500 })
    }
  }
})

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format', status: 400 })
    }
    
    const result = await userController.deleteUser(id)
    res.json(result)
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message, status: 404 })
    } else {
      res.status(500).json({ message: error.message, status: 500 })
    }
  }
})

export default router
