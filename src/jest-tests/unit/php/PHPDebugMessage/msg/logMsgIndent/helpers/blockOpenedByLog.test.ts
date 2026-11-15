import { blockOpenedByLog } from '@/debug-message/php/PHPDebugMessage/msg/logMsgIndent/helpers';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers';

describe('PHP blockOpenedByLog', () => {
  // The line opening the returned block, or null when the log opens none
  function openerLineFor(lines: string[], logMsgLine: number): number | null {
    const document = makeTextDocument(lines, 'test.php', 'php');
    const ast = parseCode(document.getText(), getPhpParser());
    const block = blockOpenedByLog(document, logMsgLine, ast);
    return block ? block.loc.start.line - 1 : null;
  }

  describe('when the log opens a block', () => {
    it('returns an empty block when the log lands on its closing brace', () => {
      const lines = [
        '<?php', // 0
        '', // 1
        'function sendWelcome($user)', // 2
        '{', // 3
        '    try {', // 4
        "        mail($user->email, 'Welcome', 'Hello');", // 5
        '    } catch (Exception $e) {', // 6
        '    }', // 7
        '}', // 8
      ];
      expect(openerLineFor(lines, 7)).toBe(6);
    });

    it('returns an empty block whose opening brace is on its own line', () => {
      const lines = [
        '<?php', // 0
        'class Mailer', // 1
        '{', // 2
        '    public function send($to)', // 3
        '    {', // 4
        '    }', // 5
        '}', // 6
      ];
      expect(openerLineFor(lines, 5)).toBe(4);
    });

    it('returns the innermost block holding the log', () => {
      const lines = [
        '<?php', // 0
        'function check($order)', // 1
        '{', // 2
        '    validate($order);', // 3
        '    if ($order->paid) {', // 4
        '    }', // 5
        '}', // 6
      ];
      expect(openerLineFor(lines, 5)).toBe(4);
    });

    it('returns the block when the log lands on a blank line above the first statement', () => {
      const lines = [
        '<?php', // 0
        'function f($a)', // 1
        '{', // 2
        '', // 3
        '  return $a;', // 4
        '}', // 5
      ];
      expect(openerLineFor(lines, 3)).toBe(2);
    });
  });

  describe('when the log does not open a block', () => {
    it('returns null past the end of the file', () => {
      const lines = [
        '<?php', // 0
        'function f()', // 1
        '{', // 2
        '}', // 3
      ];
      expect(openerLineFor(lines, 4)).toBeNull();
    });

    it('returns null outside any block', () => {
      const lines = [
        '<?php', // 0
        '$a = 1;', // 1
        'run($a);', // 2
      ];
      expect(openerLineFor(lines, 2)).toBeNull();
    });

    it('returns null above a one-line block', () => {
      const lines = [
        '<?php', // 0
        '$ready = true;', // 1
        'if ($ready) {}', // 2
      ];
      expect(openerLineFor(lines, 2)).toBeNull();
    });

    it('returns null when the log line holds code to copy', () => {
      const lines = [
        '<?php', // 0
        'function f($a)', // 1
        '{', // 2
        '    return $a;', // 3
        '}', // 4
      ];
      expect(openerLineFor(lines, 3)).toBeNull();
    });

    it('returns null when a statement comes before the log in the block', () => {
      const lines = [
        '<?php', // 0
        'function f($a)', // 1
        '{', // 2
        '    run($a);', // 3
        '}', // 4
      ];
      expect(openerLineFor(lines, 4)).toBeNull();
    });
  });
});
