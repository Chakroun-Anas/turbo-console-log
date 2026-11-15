import * as vscode from 'vscode';
import { msg } from '@/debug-message/php/PHPDebugMessage/msg/msg';
import { logMsgIndent } from '@/debug-message/php/PHPDebugMessage/msg/logMsgIndent';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers';
import { createMockTextEditorEdit } from '@/jest-tests/mocks/helpers/createMockTextEditorEdit';
import { extensionPropertiesMock } from '@/jest-tests/mocks/extensionPropertiesMock';

describe('PHP logMsgIndent when inserting a log', () => {
  function indentFor(
    lines: string[],
    selectedVarLine: number,
    logMsgLine: number,
    tabSize = 4,
  ): string {
    const document = makeTextDocument(lines, 'test.php', 'php');
    const ast = parseCode(document.getText(), getPhpParser());
    return logMsgIndent(document, selectedVarLine, logMsgLine, {
      ast,
      tabSize,
    });
  }

  const orderService = [
    '<?php',
    '',
    'class OrderService',
    '{',
    '    public function forUser($userId)',
    '    {',
    '        $orders = Order::query()',
    "            ->where('user_id', $userId)",
    '            ->get();',
    '',
    '        return $orders;',
    '    }',
    '}',
  ];
  const sendWelcome = [
    '<?php',
    '',
    'function sendWelcome($user)',
    '{',
    '    try {',
    "        mail($user->email, 'Welcome', 'Hello');",
    '    } catch (Exception $e) {',
    '    }',
    '}',
  ];

  describe('selected line deeper than its statement', () => {
    it('uses the indent of the first body statement for a parameter used in a chained call', () => {
      expect(indentFor(orderService, 7, 6)).toBe('        ');
    });

    it('uses the insertion indent for a parameter used in a nested block', () => {
      const lines = [
        '<?php',
        'function f($id)',
        '{',
        '    if (ready()) {',
        '        run($id);',
        '    }',
        '}',
      ];
      expect(indentFor(lines, 4, 3)).toBe('    ');
    });

    it('uses the statement indent for a continuation line followed by a statement', () => {
      const lines = [
        '<?php',
        'function f($query)',
        '{',
        '    $local = 1;',
        '    $rows = $query->where($local)',
        '        ->where($local + 1)',
        '        ->get();',
        '    return $rows;',
        '}',
      ];
      expect(indentFor(lines, 5, 7)).toBe('    ');
    });

    it('uses the statement indent for a continuation line closing its block', () => {
      const lines = [
        '<?php',
        'function f($query)',
        '{',
        '    $local = 1;',
        '    $query->where($local)',
        '        ->where($local + 1);',
        '}',
      ];
      expect(indentFor(lines, 5, 6)).toBe('    ');
    });

    it('still uses the selected line when it starts its statement', () => {
      const lines = [
        '<?php',
        'function f()',
        '{',
        '    $a = 1;',
        '    return $a;',
        '}',
      ];
      expect(indentFor(lines, 3, 4)).toBe('    ');
    });

    it('still indents into the body for a parameter', () => {
      const lines = ['<?php', 'function f($a)', '{', '    return $a;', '}'];
      expect(indentFor(lines, 1, 3)).toBe('    ');
    });
  });

  describe('no indent to copy from', () => {
    it('goes one level deeper than the catch for an empty catch block', () => {
      expect(indentFor(sendWelcome, 6, 7)).toBe('        ');
    });

    it('goes one level deeper for an empty method with the brace on its own line', () => {
      const lines = [
        '<?php',
        'class A',
        '{',
        '    public function run($a)',
        '    {',
        '    }',
        '}',
      ];
      expect(indentFor(lines, 3, 5)).toBe('        ');
    });

    it('goes one level deeper for an empty function with the brace on its line', () => {
      expect(indentFor(['<?php', 'function f($a) {', '}'], 1, 2)).toBe('    ');
    });

    it('goes one level deeper for an empty block with a blank first line', () => {
      expect(indentFor(['<?php', 'function f($a) {', '', '}'], 1, 2)).toBe(
        '    ',
      );
    });

    it('copies the first statement when the first line of the block is blank', () => {
      const lines = ['<?php', 'function f($a) {', '', '  return $a;', '}'];
      expect(indentFor(lines, 1, 2)).toBe('  ');
    });

    it('adds a tab in a tab-indented block', () => {
      const lines = [
        '<?php',
        'function f()',
        '{',
        '\ttry {',
        '\t\trun();',
        '\t} catch (Exception $e) {',
        '\t}',
        '}',
      ];
      expect(indentFor(lines, 5, 6)).toBe('\t\t');
    });
  });

  describe('through the insert command', () => {
    function insertion(
      lines: string[],
      selectedVar: string,
      selectedVarLine: number,
    ): { line: number; text: string } {
      const textEditor = createMockTextEditorEdit();
      msg(
        textEditor,
        makeTextDocument(lines, 'test.php', 'php'),
        selectedVar,
        selectedVarLine,
        4,
        extensionPropertiesMock,
        'var_dump',
        vscode,
        getPhpParser(),
      );
      const [position, text] = (textEditor.insert as jest.Mock).mock.calls[0];
      return { line: position.line, text };
    }

    it('logs a parameter used in a chained call at the indent of the statement', () => {
      const { line, text } = insertion(orderService, '$userId', 7);
      expect(line).toBe(6);
      expect(text).toMatch(/^ {8}\S/);
    });

    it('logs the error of an empty catch one level deeper than the catch', () => {
      const { line, text } = insertion(sendWelcome, '$e', 6);
      expect(line).toBe(7);
      expect(text).toMatch(/^ {8}\S/);
    });
  });
});
