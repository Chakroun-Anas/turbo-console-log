import { blockOpenedByLog } from '@/debug-message/js/JSDebugMessage/msg/logMsgIndent/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';

describe('blockOpenedByLog', () => {
  // The line opening the returned block, or null when the log opens none
  function openerLineFor(lines: string[], logMsgLine: number): number | null {
    const document = makeTextDocument(lines);
    const ast = parseCode(document.getText(), '.ts', logMsgLine);
    const block = blockOpenedByLog(document, logMsgLine, ast);
    return block ? block.loc.start.line - 1 : null;
  }

  describe('when the log opens a block', () => {
    it('returns an empty block when the log lands on its closing brace', () => {
      const lines = [
        'export async function sendWelcomeEmail(user) {', // 0
        '  try {', // 1
        '    await mailer.send(user.email, welcomeTemplate(user));', // 2
        '  } catch (err) {', // 3
        '  }', // 4
        '}', // 5
      ];
      expect(openerLineFor(lines, 4)).toBe(3);
    });

    it('returns the innermost block holding the log', () => {
      const lines = [
        'function check(order) {', // 0
        '  validate(order);', // 1
        '  if (order.paid) {', // 2
        '  }', // 3
        '}', // 4
      ];
      expect(openerLineFor(lines, 3)).toBe(2);
    });

    it('returns the block when the log lands on a blank line above the first statement', () => {
      const lines = [
        'function f(a) {', // 0
        '', // 1
        '  return a;', // 2
        '}', // 3
      ];
      expect(openerLineFor(lines, 1)).toBe(0);
    });
  });

  describe('when the log does not open a block', () => {
    it('returns null past the end of the file', () => {
      const lines = [
        'function f() {', // 0
        '}', // 1
      ];
      expect(openerLineFor(lines, 2)).toBeNull();
    });

    it('returns null outside any block', () => {
      const lines = [
        'const a = 1;', // 0
        'run(a);', // 1
      ];
      expect(openerLineFor(lines, 1)).toBeNull();
    });

    it('returns null above a one-line block', () => {
      const lines = [
        'const ready = true;', // 0
        'if (ready) {}', // 1
      ];
      expect(openerLineFor(lines, 1)).toBeNull();
    });

    it('returns null when the log line holds code to copy', () => {
      const lines = [
        'function f(a) {', // 0
        '  return a;', // 1
        '}', // 2
      ];
      expect(openerLineFor(lines, 1)).toBeNull();
    });

    it('returns null when a statement comes before the log in the block', () => {
      const lines = [
        'function f(a) {', // 0
        '  run(a);', // 1
        '}', // 2
      ];
      expect(openerLineFor(lines, 2)).toBeNull();
    });

    it('returns null on a blank line after a statement', () => {
      const lines = [
        'function f(a) {', // 0
        '  run(a);', // 1
        '', // 2
        '  return a;', // 3
        '}', // 4
      ];
      expect(openerLineFor(lines, 2)).toBeNull();
    });
  });
});
