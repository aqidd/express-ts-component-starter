/**
 * 2025-03-28: Created User controller
 * - Implemented business logic for user operations
 * - Added error handling and validation
 * - Separated business logic from repository layer
 */

import { UserRepository } from './user-repository'
import { UserInput } from './user'

export class UserController {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  async getAllUsers() {
    try {
      return await this.userRepository.findAll()
    } catch (error) {
      throw error
    }
  }

  async getUserById(id: number) {
    try {
      const user = await this.userRepository.findById(id)
      if (!user) {
        throw new Error('User not found')
      }
      return user
    } catch (error) {
      throw error
    }
  }

  async createUser(userData: UserInput) {
    try {
      // Validate user data
      this.validateUserData(userData)
      
      return await this.userRepository.create(userData)
    } catch (error) {
      throw error
    }
  }

  async updateUser(id: number, userData: Partial<UserInput>) {
    try {
      // Validate user data
      if (Object.keys(userData).length === 0) {
        throw new Error('No data provided for update')
      }
      
      const updatedUser = await this.userRepository.update(id, userData)
      if (!updatedUser) {
        throw new Error('User not found')
      }
      
      return updatedUser
    } catch (error) {
      throw error
    }
  }

  async deleteUser(id: number) {
    try {
      const deleted = await this.userRepository.delete(id)
      if (!deleted) {
        throw new Error('User not found')
      }
      
      return { message: 'User deleted successfully' }
    } catch (error) {
      throw error
    }
  }

  private validateUserData(userData: UserInput) {
    // Validate username
    if (!userData.username || userData.username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters long')
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!userData.email || !emailRegex.test(userData.email)) {
      throw new Error('Valid email address is required')
    }
    
    // Validate password
    if (!userData.password || userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }
  }
}
