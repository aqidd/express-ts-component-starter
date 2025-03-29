/**
 * 2025-03-29: Created unit tests for UserController
 * - Added tests for all controller methods
 * - Implemented mocking for repository dependency
 * - Added test cases for success and error scenarios
 */

import { mock } from 'jest-mock-extended'
import { UserController } from '@components/User/user-controller'
import { UserRepository } from '@components/User/user-repository'
import { User, UserInput } from '@components/User/user'

// Mock the UserRepository
jest.mock('@components/User/user-repository')

describe('UserController', () => {
  let userController: UserController
  let mockUserRepository: jest.Mocked<UserRepository>
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()
    
    // Reset the constructor mock
    const UserRepositoryMock = UserRepository as jest.MockedClass<typeof UserRepository>
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      validatePassword: jest.fn()
    } as unknown as jest.Mocked<UserRepository>
    
    // Make the constructor return our mock
    UserRepositoryMock.mockImplementation(() => mockUserRepository)
    
    // Create a new controller instance for each test
    userController = new UserController()
  })
  
  describe('getAllUsers', () => {
    it('should return all users from repository', async () => {
      // Mock data
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com', created_at: '2025-01-01', updated_at: '2025-01-01' },
        { id: 2, username: 'user2', email: 'user2@example.com', created_at: '2025-01-02', updated_at: '2025-01-02' }
      ]
      
      // Setup mock
      mockUserRepository.findAll.mockResolvedValueOnce(mockUsers)
      
      // Execute
      const result = await userController.getAllUsers()
      
      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled()
      expect(result).toEqual(mockUsers)
    })
    
    it('should propagate errors from repository', async () => {
      // Setup mock to throw error
      const error = new Error('Repository error')
      mockUserRepository.findAll.mockRejectedValueOnce(error)
      
      // Execute and assert
      await expect(userController.getAllUsers()).rejects.toThrow('Repository error')
    })
  })
  
  describe('getUserById', () => {
    it('should return user by id from repository', async () => {
      // Mock data
      const mockUser = { 
        id: 1, 
        username: 'user1', 
        email: 'user1@example.com', 
        created_at: '2025-01-01', 
        updated_at: '2025-01-01' 
      }
      
      // Setup mock
      mockUserRepository.findById.mockResolvedValueOnce(mockUser)
      
      // Execute
      const result = await userController.getUserById(1)
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockUser)
    })
    
    it('should throw error if user not found', async () => {
      // Setup mock
      mockUserRepository.findById.mockResolvedValueOnce(null)
      
      // Execute and assert
      await expect(userController.getUserById(999)).rejects.toThrow('User not found')
    })
    
    it('should propagate errors from repository', async () => {
      // Setup mock to throw error
      const error = new Error('Repository error')
      mockUserRepository.findById.mockRejectedValueOnce(error)
      
      // Execute and assert
      await expect(userController.getUserById(1)).rejects.toThrow('Repository error')
    })
  })
  
  describe('createUser', () => {
    it('should create a new user', async () => {
      // Mock data
      const userData: UserInput = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      }
      
      const createdUser = {
        id: 3,
        username: 'newuser',
        email: 'newuser@example.com',
        created_at: '2025-01-03',
        updated_at: '2025-01-03'
      }
      
      // Setup mock
      mockUserRepository.create.mockResolvedValueOnce(createdUser)
      
      // Execute
      const result = await userController.createUser(userData)
      
      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData)
      expect(result).toEqual(createdUser)
    })
    
    it('should validate user data before creating', async () => {
      // Test cases for validation
      const testCases = [
        { 
          data: { username: 'ab', email: 'valid@example.com', password: 'password123' },
          error: 'Username must be at least 3 characters long'
        },
        { 
          data: { username: 'validuser', email: 'invalid-email', password: 'password123' },
          error: 'Valid email address is required'
        },
        { 
          data: { username: 'validuser', email: 'valid@example.com', password: '12345' },
          error: 'Password must be at least 6 characters long'
        }
      ]
      
      for (const testCase of testCases) {
        // Execute and assert
        await expect(userController.createUser(testCase.data as UserInput))
          .rejects.toThrow(testCase.error)
          
        // Verify repository was not called
        expect(mockUserRepository.create).not.toHaveBeenCalled()
      }
    })
    
    it('should propagate errors from repository', async () => {
      // Mock data
      const userData: UserInput = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      }
      
      // Setup mock to throw error
      const error = new Error('Repository error')
      mockUserRepository.create.mockRejectedValueOnce(error)
      
      // Execute and assert
      await expect(userController.createUser(userData)).rejects.toThrow('Repository error')
    })
  })
  
  describe('updateUser', () => {
    it('should update an existing user', async () => {
      // Mock data
      const userData = {
        username: 'updateduser',
        email: 'updated@example.com'
      }
      
      const updatedUser = {
        id: 1,
        username: 'updateduser',
        email: 'updated@example.com',
        created_at: '2025-01-01',
        updated_at: '2025-01-03'
      }
      
      // Setup mock
      mockUserRepository.update.mockResolvedValueOnce(updatedUser)
      
      // Execute
      const result = await userController.updateUser(1, userData)
      
      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, userData)
      expect(result).toEqual(updatedUser)
    })
    
    it('should throw error if no data provided for update', async () => {
      // Execute and assert
      await expect(userController.updateUser(1, {})).rejects.toThrow('No data provided for update')
      expect(mockUserRepository.update).not.toHaveBeenCalled()
    })
    
    it('should throw error if user not found', async () => {
      // Setup mock
      mockUserRepository.update.mockResolvedValueOnce(null)
      
      // Execute and assert
      await expect(userController.updateUser(999, { username: 'newname' }))
        .rejects.toThrow('User not found')
    })
    
    it('should propagate errors from repository', async () => {
      // Setup mock to throw error
      const error = new Error('Repository error')
      mockUserRepository.update.mockRejectedValueOnce(error)
      
      // Execute and assert
      await expect(userController.updateUser(1, { username: 'newname' }))
        .rejects.toThrow('Repository error')
    })
  })
  
  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      // Setup mock
      mockUserRepository.delete.mockResolvedValueOnce(true)
      
      // Execute
      const result = await userController.deleteUser(1)
      
      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1)
      expect(result).toEqual({ message: 'User deleted successfully' })
    })
    
    it('should throw error if user not found', async () => {
      // Setup mock
      mockUserRepository.delete.mockResolvedValueOnce(false)
      
      // Execute and assert
      await expect(userController.deleteUser(999)).rejects.toThrow('User not found')
    })
    
    it('should propagate errors from repository', async () => {
      // Setup mock to throw error
      const error = new Error('Repository error')
      mockUserRepository.delete.mockRejectedValueOnce(error)
      
      // Execute and assert
      await expect(userController.deleteUser(1)).rejects.toThrow('Repository error')
    })
  })
  
  describe('validateUserData', () => {
    // Test the private method through a public method
    it('should validate username correctly', async () => {
      const validData = {
        username: 'validuser',
        email: 'valid@example.com',
        password: 'password123'
      }
      
      const invalidData = {
        username: 'ab', // Too short
        email: 'valid@example.com',
        password: 'password123'
      }
      
      // Setup mock for the valid case
      mockUserRepository.create.mockResolvedValueOnce({
        id: 1,
        ...validData,
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      })
      
      // Test valid data
      await userController.createUser(validData)
      expect(mockUserRepository.create).toHaveBeenCalledWith(validData)
      
      // Test invalid data
      await expect(userController.createUser(invalidData))
        .rejects.toThrow('Username must be at least 3 characters long')
    })
    
    it('should validate email correctly', async () => {
      const validData = {
        username: 'validuser',
        email: 'valid@example.com',
        password: 'password123'
      }
      
      const invalidData = {
        username: 'validuser',
        email: 'invalid-email', // Invalid format
        password: 'password123'
      }
      
      // Setup mock for the valid case
      mockUserRepository.create.mockResolvedValueOnce({
        id: 1,
        ...validData,
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      })
      
      // Test valid data
      await userController.createUser(validData)
      expect(mockUserRepository.create).toHaveBeenCalledWith(validData)
      
      // Test invalid data
      await expect(userController.createUser(invalidData))
        .rejects.toThrow('Valid email address is required')
    })
    
    it('should validate password correctly', async () => {
      const validData = {
        username: 'validuser',
        email: 'valid@example.com',
        password: 'password123'
      }
      
      const invalidData = {
        username: 'validuser',
        email: 'valid@example.com',
        password: '12345' // Too short
      }
      
      // Setup mock for the valid case
      mockUserRepository.create.mockResolvedValueOnce({
        id: 1,
        ...validData,
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      })
      
      // Test valid data
      await userController.createUser(validData)
      expect(mockUserRepository.create).toHaveBeenCalledWith(validData)
      
      // Test invalid data
      await expect(userController.createUser(invalidData))
        .rejects.toThrow('Password must be at least 6 characters long')
    })
  })
})
