// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'src/mocha-tests/files/*',
      'src/jest-tests/unit/js/JSDebugMessage/TurboTextDocument/fixtures/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
];
