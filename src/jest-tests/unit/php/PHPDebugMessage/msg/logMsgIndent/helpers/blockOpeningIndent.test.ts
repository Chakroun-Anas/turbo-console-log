import {
  blockOpenedByLog,
  blockOpeningIndent,
} from '@/debug-message/php/PHPDebugMessage/msg/logMsgIndent/helpers';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers';

describe('PHP blockOpeningIndent', () => {
  // The indent of a log on `logMsgLine`, in the block that log opens
  function indentFor(lines: string[], logMsgLine: number, tabSize = 4): string {
    const document = makeTextDocument(lines, 'test.php', 'php');
    const ast = parseCode(document.getText(), getPhpParser());
    const block = blockOpenedByLog(document, logMsgLine, ast);
    if (!block) {
      throw new Error(`No block opened by a log on line ${logMsgLine}`);
    }
    return blockOpeningIndent(document, block, tabSize);
  }

  it('goes one level deeper than the line opening an empty block', () => {
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
    expect(indentFor(lines, 7)).toBe('        ');
  });

  it('goes one level deeper than an opening brace on its own line', () => {
    const lines = [
      '<?php', // 0
      'class Mailer', // 1
      '{', // 2
      '    public function send($to)', // 3
      '    {', // 4
      '    }', // 5
      '}', // 6
    ];
    expect(indentFor(lines, 5)).toBe('        ');
  });

  it('adds a tab in a tab-indented block', () => {
    const lines = [
      '<?php', // 0
      'function send()', // 1
      '{', // 2
      '\ttry {', // 3
      '\t\trun();', // 4
      '\t} catch (Exception $e) {', // 5
      '\t}', // 6
      '}', // 7
    ];
    expect(indentFor(lines, 6)).toBe('\t\t');
  });

  it('copies the first statement of the block', () => {
    const lines = [
      '<?php', // 0
      'function f($a)', // 1
      '{', // 2
      '', // 3
      '  return $a;', // 4
      '}', // 5
    ];
    expect(indentFor(lines, 3)).toBe('  ');
  });
});
