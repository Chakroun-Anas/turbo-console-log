# Copilot / AI Agent Instructions — Turbo Console Log

Short, actionable guidance to get productive quickly in this repo.

## Quick facts ✅
- Type: VS Code extension (TypeScript). Entry: `src/extension.ts` -> bundled to `out/extension.js` via `esbuild`.
- Build: `npm run esbuild` (or `npm run watch` for dev). Prepublish: `npm run vscode:prepublish`.
- Tests: `npm run test` (runs `jest` unit tests then mocha integration tests with `vscode-test`).
- Lint/typecheck: `npm run lint` (runs `tsc` and `eslint`).

## Where to start (high-value files) 🔍
- Extension bootstrap: `src/extension.ts` (registers commands, webviews, pro bundle logic).
- Commands: `src/commands/*` — each command exports a factory returning a `Command` with a `handler` (pattern to follow when adding commands).
- Language-specific message builders & detectors: `src/debug-message/*` (e.g. `src/debug-message/js/JSDebugMessage/`).
- Pro & bundle logic: `src/pro/` and `src/pro/utilities.ts` (functions `runProBundle`, `updateProBundle` and `activateRepairMode`).
- Telemetry & notifications: `src/telemetry/*` and `src/notifications/*` (telemetry can be toggled via `turboConsoleLog.isTurboTelemetryEnabled`).
- Tests:
  - Unit: `src/jest-tests/**` (Jest config lives in `jest.config.ts`, aliases `@/` -> `src/`).
  - Integration: `src/mocha-tests/**` (uses `vscode-test`). Note: `src/mocha-tests/runTests.ts` hardcodes `platform = 'darwin-arm64'` — change for other platforms.

## Project-specific patterns & conventions 🧭
- Commands registration: use `getAllCommands()` and return `Command` instances from `src/commands/*`.
- Dependency on extension settings is passed as an `ExtensionProperties` object built in `src/extension.ts` via `getExtensionProperties(config)`.
- Language abstraction: `DebugMessage` interface used to implement `msg` (insert) and `detectAll` (find logs) per-language. Add a new language by implementing this interface in `src/debug-message/<lang>/` and wire it into `src/extension.ts` and helpers.
- Turbo-generated logs identification: Turbo marks logs using two settings: `turboConsoleLog.logMessagePrefix` and `turboConsoleLog.delimiterInsideMessage`. Detection uses fast regex + document parsing in `src/debug-message/js/JSDebugMessage/detectAll.ts` — look there when modifying detection.
- PHP support: PHP message builder is loaded from the Pro bundle (`loadPhpDebugMessage(context)`) — adding PHP features may require Pro bundle changes instead of core JS/TS code.

## Tests & CI notes ⚙️
- `npm run test` flow:
  1. `npm run test:compile` (tsc compile + copies `src/mocha-tests/files` into `out/mocha-tests/files`)
  2. `npm run test:jest` (unit tests)
  3. `node ./out/mocha-tests/runTests.js` (integration tests run with `vscode-test`).
- If running mocha integration tests locally, update `src/mocha-tests/runTests.ts` `platform` and `vscodeVersion` as needed for your environment.
- Jest uses module mappings for `vscode` and `p-limit` (see `jest.config.ts`). Add mocks under `src/jest-tests/mocks/` when testing VS Code interactions.

## Known quirks & gotchas ⚠️
- `dependencies` contains a local tarball reference (`@sveltejs/acorn-typescript` via `file:../../acorn-typescript/...`). Fresh clones may need that tarball or to replace the dependency with a published package.
- Integration tests assume an environment with VS Code test runner; platform is hardcoded (see above).
- Telemetry is enabled by default (setting `turboConsoleLog.isTurboTelemetryEnabled`); test suites assert telemetry behaviour in `src/jest-tests/unit/telemetry/telemetryService.test.ts`.

## How to add a feature (quick checklist) 📝
1. Add command factory in `src/commands/` and export via `getAllCommands()`.
2. Use `ExtensionProperties` for config values; prefer passing `extensionProperties` to handlers.
3. For language behavior, add/extend `DebugMessage` implementation under `src/debug-message/<lang>/` and update detection if necessary.
4. Add unit tests in `src/jest-tests/` (mock `vscode` for logic-level tests). For behaviour that requires the VS Code host, add integration tests under `src/mocha-tests/`.
5. Run `npm run lint` and `npm run test` before raising PR.

## Files to check for examples
- Insertion implementation: `src/debug-message/js/JSDebugMessage/msg/` (shows how log string is constructed).
- Detection logic: `src/debug-message/js/JSDebugMessage/detectAll.ts` (fast regex pre-filter + document parsing).
- Command pattern: `src/commands/insertConsoleLog.ts` (typical command handler).

## Quick test example (copy-paste) ✅
Use this as a starting point for small unit tests. It follows existing repo conventions (see `src/jest-tests/unit/**`).

```ts
import * as fs from 'fs';
import { detectAll } from '@/debug-message/js/JSDebugMessage/detectAll/detectAll';
import { mockedVscode } from '../../mocks/vscode'; // repo provides vscode mocks

test('detectAll returns empty when no logs are present', async () => {
  jest.spyOn(fs.promises, 'readFile' as any).mockResolvedValue('const a = 1;');
  const vscode = mockedVscode();
  const result = await detectAll(fs, vscode, '/path/to/file.js', 'log', '🚀', '~');
  expect(result).toEqual([]);
});
```

**Command handler (unit test) example** — mock `vscode.window.activeTextEditor` and assert that `debugMessage.msg` is called for each selection.

```ts
import * as vscode from 'vscode';
import { insertConsoleLogCommand } from '@/commands/insertConsoleLog';

jest.mock('@/helpers', () => ({
  canInsertLogInDocument: jest.fn().mockReturnValue(true),
  trackLogInsertions: jest.fn(),
  loadPhpDebugMessage: jest.fn(),
}));

it('calls debugMessage.msg when inserting a log', async () => {
  const command = insertConsoleLogCommand();
  const fakeEditor = {
    selections: [new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 0))],
    document: { languageId: 'javascript', getText: () => '' } as any,
    edit: jest.fn((fn) => Promise.resolve(true)),
  } as unknown as vscode.TextEditor;

  jest.spyOn(vscode.window, 'activeTextEditor', 'get').mockReturnValue(fakeEditor);

  const handler = command.handler as any;
  await handler({ extensionProperties: { logFunction: 'log' }, debugMessage: { msg: jest.fn(), detectAll: jest.fn() } as any, context: {} });

  expect(fakeEditor.edit).toHaveBeenCalled();
});
```

**Integration test note** — mocha integration tests use `vscode-test`. `src/mocha-tests/runTests.ts` now respects environment variables to make CI easier:

- `VSCODE_TEST_PLATFORM` (e.g., `darwin-x64`, `darwin-arm64`, `linux-x64`)
- `VSCODE_TEST_VERSION` (e.g., `stable`)

Run integration tests locally or in CI with:

```bash
export VSCODE_TEST_PLATFORM=linux-x64
export VSCODE_TEST_VERSION=stable
npm run test:compile && node ./out/mocha-tests/runTests.js
```

CI workflow example is provided in `.github/workflows/ci.yml` and runs lint+unit tests on Linux, and integration tests on macOS & Linux (sets platform via env).

**Coverage** — run Jest coverage locally with `npm run test:jest:coverage` (produces `coverage/lcov.info`). The CI uploads this file to Codecov using `codecov/codecov-action@v4`; after the first successful run the Codecov badge in the `README` will reflect coverage.

Open the generated HTML coverage report locally (choose one):

- macOS: `npm run test:jest:coverage && open ./coverage/lcov-report/index.html`
- Linux: `npm run test:jest:coverage && xdg-open ./coverage/lcov-report/index.html`
- Windows (PowerShell): `npm run test:jest:coverage; Start-Process ./coverage/lcov-report/index.html`

If you don't have a system opener, serve it on a local port:

```bash
npm run test:jest:coverage && npx http-server ./coverage/lcov-report -p 8080
# then open http://localhost:8080 in your browser
```

**Sample mock file** — see `src/jest-tests/mocks/axios.ts` for a jest-style `axios` mock (exported as default). Use `jest.mock('axios')` in tests or import this mock directly when needed.

See `src/jest-tests/unit/js/JSDebugMessage/detectAll/detectAll.test.ts` for extensive test patterns and mocking examples.

---
If anything here is unclear or you want more detail for a particular area (testing, adding a language, or Pro bundle workflow), tell me which part to expand and I’ll iterate. Thanks!