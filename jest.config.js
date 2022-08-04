const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig.json')

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = config = {
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: pathsToModuleNameMapper(
    compilerOptions.paths,
    { prefix: '<rootDir>/' },
  ),
  modulePathIgnorePatterns: [
    '<rootDir>/dist',
    '<rootDir>/node_modules',
    '<rootDir>/out',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '**/tests/**/*.(spec|test).(ts?(x)|js?(x))',
  ],
  collectCoverage: true,
  verbose: true,
};
