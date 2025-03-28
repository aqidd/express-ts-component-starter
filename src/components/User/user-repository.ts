/**
 * 2025-03-28: Created User repository
 * - Implemented CRUD operations for User model
 * - Added error handling and validation
 * - Used Knex query builder for database operations
 */

import db from '@libraries/database/db'
import { User, UserInput, UserOutput } from './user'
import bcrypt from 'bcrypt'

export class UserRepository {
  private tableName = 'users'

  async findAll(): Promise<UserOutput[]> {
    try {
      const users = await db(this.tableName).select('id', 'username', 'email', 'created_at', 'updated_at')
      return users
    } catch (error) {
      console.error('Error finding all users:', error)
      throw new Error('Failed to retrieve users')
    }
  }

  async findById(id: number): Promise<UserOutput | null> {
    try {
      const user = await db(this.tableName)
        .select('id', 'username', 'email', 'created_at', 'updated_at')
        .where({ id })
        .first()
      
      return user || null
    } catch (error) {
      console.error(`Error finding user with id ${id}:`, error)
      throw new Error(`Failed to retrieve user with id ${id}`)
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await db(this.tableName)
        .where({ email })
        .first()
      
      return user || null
    } catch (error) {
      console.error(`Error finding user with email ${email}:`, error)
      throw new Error(`Failed to retrieve user with email ${email}`)
    }
  }

  async create(userData: UserInput): Promise<UserOutput> {
    try {
      // Check if user with email already exists
      const existingUser = await this.findByEmail(userData.email)
      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(userData.password, salt)

      // Create user with hashed password
      const [id] = await db(this.tableName).insert({
        ...userData,
        password: hashedPassword
      })

      // Return created user (without password)
      const newUser = await this.findById(id)
      if (!newUser) {
        throw new Error('Failed to retrieve created user')
      }
      
      return newUser
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async update(id: number, userData: Partial<UserInput>): Promise<UserOutput | null> {
    try {
      // Check if user exists
      const existingUser = await this.findById(id)
      if (!existingUser) {
        return null
      }

      // If updating password, hash it
      if (userData.password) {
        const salt = await bcrypt.genSalt(10)
        userData.password = await bcrypt.hash(userData.password, salt)
      }

      // Update user
      await db(this.tableName)
        .where({ id })
        .update({
          ...userData,
          updated_at: db.fn.now()
        })

      // Return updated user
      return this.findById(id)
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error)
      throw new Error(`Failed to update user with id ${id}`)
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      // Check if user exists
      const existingUser = await this.findById(id)
      if (!existingUser) {
        return false
      }

      // Delete user
      await db(this.tableName).where({ id }).del()
      return true
    } catch (error) {
      console.error(`Error deleting user with id ${id}:`, error)
      throw new Error(`Failed to delete user with id ${id}`)
    }
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    try {
      // Find user by email
      const user = await this.findByEmail(email)
      if (!user) {
        return null
      }

      // Compare passwords
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return null
      }

      return user
    } catch (error) {
      console.error('Error validating password:', error)
      throw new Error('Failed to validate password')
    }
  }
}
