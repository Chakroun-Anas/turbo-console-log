import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/jest-tests/**/*.test.ts'],
  // testMatch: [
  //   '<rootDir>/src/jest-tests/unit/js/JSDebugMessage/logMessage/helpers/binaryExpressionChecker/binaryExpressionChecker.test.ts',
  // ],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/src/jest-tests/tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^vscode$': '<rootDir>/src/jest-tests/mocks/vscode.ts',
    '^p-limit$': '<rootDir>/src/jest-tests/mocks/pLimit.ts',
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/src/jest-tests/',
    '<rootDir>/src/debug-message/js/index.ts',
  ],
};

export default config;
