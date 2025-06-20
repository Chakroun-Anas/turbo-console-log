# ✅ Turbo Console Log – Jest Tests

This folder contains **unit and integration tests** powered by **Jest**.

## 🧪 Testing Framework

[Jest](https://jestjs.io/) is a modern testing framework offering:

- Fast and isolated test execution
- Snapshot testing
- Built-in mocking utilities
- Clear and readable error output
- First-class TypeScript support via `ts-jest`

## 📁 Folder Structure

```
jest-tests/
├── unit/                         # Unit tests by logic/feature
│   └── js/
│       └── loc-processing/
│           ├── object/
│           │   └── assignment.test.ts
│           ├── function/
│           │   ├── function-name.test.ts
│           │   └── function-call.test.ts
├── commands/
│   └── getAllCommands.test.ts    # Command-level logic tests
├── mocks/                        # Manual Jest mocks
│   └── vscode.ts
├── tsconfig.json                 # Jest-specific TypeScript config
└── README.md
```

## 🧬 Writing Tests

- Use `.test.ts` for all test files.
- Group by **feature** or **logic domain**.
- Use `jest.mock()` to isolate dependencies as needed.
- You **do not need to import** `describe`, `test`, or `expect` if your `tsconfig` includes `@types/jest`.

## 🚀 Running Tests

```bash
npm run test:jest
```
