/**
 * 2025-03-28: Created Knex configuration for database connections
 * - Set up development, testing, and production environments
 * - Configured migrations and seeds directories
 * - Added support for SQLite, MySQL, and PostgreSQL
 * - Dynamically selects database client based on DB_TYPE environment variable
 */

import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const BASE_PATH = path.join(__dirname, '../../..')
const DB_TYPE = process.env.DB_TYPE || 'sqlite'
const DB_PATH = process.env.DB_PATH || './data/sqlite/database.sqlite'

// Helper function to get the appropriate connection config based on DB_TYPE
const getConnectionConfig = (dbType: string, dbPath: string) => {
  switch (dbType) {
    case 'postgres':
      return dbPath // Connection string for PostgreSQL
    case 'mysql':
      return dbPath // Connection string for MySQL
    case 'sqlite':
    default:
      return {
        filename: path.join(BASE_PATH, dbPath)
      }
  }
}

module.exports = {
  development: {
    client: DB_TYPE === 'postgres' ? 'pg' : DB_TYPE === 'mysql' ? 'mysql2' : 'sqlite3',
    connection: getConnectionConfig(DB_TYPE, DB_PATH),
    migrations: {
      directory: path.join(BASE_PATH, 'src/libraries/database/migrations')
    },
    seeds: {
      directory: path.join(BASE_PATH, 'src/libraries/database/seeds')
    },
    useNullAsDefault: DB_TYPE === 'sqlite',
    pool: {
      min: 2,
      max: 10,
      afterCreate: (conn: any, done: Function) => {
        // Enable foreign keys in SQLite
        if (DB_TYPE === 'sqlite') {
          conn.run('PRAGMA foreign_keys = ON', done)
        } else {
          done(null, conn)
        }
      }
    }
  },
  test: {
    client: 'sqlite3', // Always use SQLite for testing (in-memory)
    connection: {
      filename: ':memory:'
    },
    migrations: {
      directory: path.join(BASE_PATH, 'src/libraries/database/migrations')
    },
    seeds: {
      directory: path.join(BASE_PATH, 'src/libraries/database/seeds')
    },
    useNullAsDefault: true
  },
  production: {
    client: DB_TYPE === 'postgres' ? 'pg' : DB_TYPE === 'mysql' ? 'mysql2' : 'sqlite3',
    connection: getConnectionConfig(DB_TYPE, DB_PATH),
    migrations: {
      directory: path.join(BASE_PATH, 'src/libraries/database/migrations')
    },
    seeds: {
      directory: path.join(BASE_PATH, 'src/libraries/database/seeds')
    },
    useNullAsDefault: DB_TYPE === 'sqlite',
    pool: {
      min: 2,
      max: 10,
      afterCreate: (conn: any, done: Function) => {
        // Enable foreign keys in SQLite
        if (DB_TYPE === 'sqlite') {
          conn.run('PRAGMA foreign_keys = ON', done)
        } else {
          done(null, conn)
        }
      }
    }
  }
}
