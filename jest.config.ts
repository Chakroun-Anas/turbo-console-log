import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/jest-tests/**/*.test.ts'],
  // testMatch: ['<rootDir>/src/jest-tests/**/showLatestReleaseWebView.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/src/jest-tests/tsconfig.json',
      },
    ],
  },
  transformIgnorePatterns: [
    // Transform ESM in these dependencies so Jest can load them
    '/node_modules/(?!(?:@sveltejs/acorn-typescript|acorn-jsx)/)',
  ],
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
