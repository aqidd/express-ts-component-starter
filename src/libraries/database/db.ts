/**
 * 2025-03-28: Created database connection provider
 * - Set up Knex connection to SQLite
 * - Added connection initialization and error handling
 */

import knex from 'knex'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Get environment
const environment = process.env.NODE_ENV || 'development'

// Import knexfile configuration
const config = require('../../app/config/knexfile')[environment]

// Create database connection
const db = knex(config)

// Test connection
db.raw('SELECT 1')
  .then(() => {
    console.log(`Connected to ${config.client} database in ${environment} mode`)
  })
  .catch((err) => {
    console.error('Database connection error:', err)
  })

export default db
