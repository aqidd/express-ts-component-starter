/**
 * 2025-03-29: Created Jest setup file
 * - Added global mocks for database connections
 * - Prevents actual database connections during tests
 */

// Mock the database module
jest.mock('./src/libraries/database/db', () => {
  const db = jest.fn()
  db.raw = jest.fn().mockResolvedValue([{ '1': 1 }])
  db.fn = { now: jest.fn() }
  
  return {
    __esModule: true,
    default: db
  }
})

// Silence console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}
