/**
 * 2025-03-28: Created seed file for users table
 * - Added sample users with hashed passwords
 * - Used bcrypt for password hashing
 */

import { Knex } from 'knex'
import bcrypt from 'bcrypt'

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del()

  // Hash passwords
  const salt = await bcrypt.genSalt(10)
  const password1 = await bcrypt.hash('password123', salt)
  const password2 = await bcrypt.hash('password456', salt)

  // Inserts seed entries
  await knex('users').insert([
    { 
      username: 'admin',
      email: 'admin@example.com',
      password: password1
    },
    { 
      username: 'user',
      email: 'user@example.com',
      password: password2
    }
  ])
}
