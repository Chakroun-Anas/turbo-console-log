import {
  blockOpenedByLog,
  blockOpeningIndent,
} from '@/debug-message/js/JSDebugMessage/msg/logMsgIndent/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';

describe('blockOpeningIndent', () => {
  // The indent of a log on `logMsgLine`, in the block that log opens
  function indentFor(lines: string[], logMsgLine: number, tabSize = 2): string {
    const document = makeTextDocument(lines);
    const ast = parseCode(document.getText(), '.ts', logMsgLine);
    const block = blockOpenedByLog(document, logMsgLine, ast);
    if (!block) {
      throw new Error(`No block opened by a log on line ${logMsgLine}`);
    }
    return blockOpeningIndent(document, block, tabSize);
  }

  it('goes one level deeper than the line opening an empty block', () => {
    const lines = [
      'export async function sendWelcomeEmail(user) {', // 0
      '  try {', // 1
      '    await mailer.send(user.email, welcomeTemplate(user));', // 2
      '  } catch (err) {', // 3
      '  }', // 4
      '}', // 5
    ];
    expect(indentFor(lines, 4)).toBe('    ');
  });

  it('adds a tab in a tab-indented block', () => {
    const lines = [
      'function f() {', // 0
      '\ttry {', // 1
      '\t\trun();', // 2
      '\t} catch (err) {', // 3
      '\t}', // 4
      '}', // 5
    ];
    expect(indentFor(lines, 4)).toBe('\t\t');
  });

  it('adds the editor tab size in spaces when nothing in the file is indented', () => {
    const lines = [
      'function noop() {', // 0
      '}', // 1
    ];
    expect(indentFor(lines, 1, 4)).toBe('    ');
  });

  it('copies the first statement of the block', () => {
    const lines = [
      'function f(a) {', // 0
      '', // 1
      '  return a;', // 2
      '}', // 3
    ];
    expect(indentFor(lines, 1, 4)).toBe('  ');
  });
});
