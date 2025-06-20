import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/jest-tests/**/*.test.ts'],
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
    '^vscode$': '<rootDir>/src/jest-tests/mocks/vscode.ts',
  },
};

export default config;
