/**
 * 2025-03-28: Created User model
 * - Defined User interface with required fields
 * - Added type definitions for user-related operations
 */

export interface User {
  id?: number
  username: string
  email: string
  password: string
  created_at?: string
  updated_at?: string
}

export interface UserInput {
  username: string
  email: string
  password: string
}

export interface UserOutput {
  id: number
  username: string
  email: string
  created_at: string
  updated_at: string
}
