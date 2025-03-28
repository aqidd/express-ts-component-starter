/**
 * 2025-03-28: Created migration for users table
 * - Added username, email, and password fields
 * - Set up primary key and unique constraints
 * - Added timestamps for created_at and updated_at
 */

import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary()
    table.string('username', 50).notNullable().unique()
    table.string('email', 255).notNullable().unique()
    table.string('password', 255).notNullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users')
}
