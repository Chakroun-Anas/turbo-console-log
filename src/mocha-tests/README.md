# 🧪 Turbo Console Log – Mocha Tests

This folder contains **integration tests** that execute the extension inside a real VSCode instance.  
We use **Mocha** here due to its compatibility with the official [VSCode Extension Test Runner](https://code.visualstudio.com/api/working-with-extensions/testing-extension).

## 🔧 Testing Framework

### **Mocha**

[Mocha](https://mochajs.org/) is a flexible, mature test runner that supports:

- Asynchronous test execution
- TDD and BDD syntax
- Lifecycle hooks (`before`, `after`, `beforeEach`, `afterEach`)

### **Chai**

[Chai](https://www.chaijs.com/) provides expressive assertions using `expect`, `should`, or `assert`.

## 📁 Folder Structure

```
mocha-tests/
├── files/                   # Test fixture files used in integration
├── integration/             # VSCode extension integration tests
│   └── insert-log/
│       └── insertLogAtCursor.test.ts
├── unit/                    # (Deprecated) Mocha-based unit tests (migrating to Jest)
├── runTests.ts              # Entry point
├── testsRunner.ts           # Mocha runner loader
└── README.md                # You are here
```

## 🧬 Writing Tests

- Use the `.test.ts` suffix.
- Place test files inside `integration/` or `unit/` directories.
- Leverage helpers from `helpers/` like:
  - `expectActiveTextEditorWithFile`
  - `documentLinesChanged`

## 🚀 Running Tests

### ▶️ Via CLI (headless)

```bash
npm run test
```

> ⚠️ VSCode **must be closed** for CLI integration tests to run properly.

### 🐞 With Debugger (recommended)

1. Run `npm run test:compile`
2. Open the **Debug View** in VSCode
3. Select **VSCode Integration Tests** from the launch dropdown
4. Press **F5** to start debugging

To run a single test file, use `.only` (e.g., `it.only(...)`)  
Just don’t forget to remove it before committing 😉
