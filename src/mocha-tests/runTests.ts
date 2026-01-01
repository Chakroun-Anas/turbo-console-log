import * as path from 'path';
import { runTests } from 'vscode-test';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './testsRunner');

    // Allow CI and local overrides via environment variables for flexibility
    // Examples:
    //  VSCODE_TEST_VERSION=stable
    //  VSCODE_TEST_PLATFORM=linux-x64
    const vscodeVersion = process.env.VSCODE_TEST_VERSION || 'stable';
    const platform = process.env.VSCODE_TEST_PLATFORM || 'darwin-arm64';

    await runTests({
      version: vscodeVersion,
      platform,
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: ['--disable-extensions'],
    });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}

main();
