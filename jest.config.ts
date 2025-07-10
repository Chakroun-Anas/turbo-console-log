import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/jest-tests/**/*.test.ts'],
  // testMatch: ['<rootDir>/src/jest-tests/**/ternaryExpressionLine.test.ts'],
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
};

export default config;
