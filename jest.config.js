/**
 * 2025-03-29: Created Jest configuration
 * - Set up TypeScript support with ts-jest
 * - Added module name mapping for path aliases
 * - Configured test environment and coverage settings
 * - Added setup file to mock database connections
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@libraries/(.*)$': '<rootDir>/src/libraries/$1'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/app/server.ts'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
}
