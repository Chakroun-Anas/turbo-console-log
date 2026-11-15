import { isBlockNode } from '@/debug-message/php/PHPDebugMessage/msg/logMsgIndent/helpers';
import {
  parseCode,
  walk,
} from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import type { PHPNode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import { getPhpParser } from '@/jest-tests/mocks/helpers';

describe('PHP isBlockNode', () => {
  function firstNodeOfKind(lines: string[], kind: string): PHPNode {
    const ast = parseCode(lines.join('\n'), getPhpParser());
    let found: PHPNode | undefined;
    walk(ast, (node) => {
      if (!found && node.kind === kind) found = node;
    });
    if (!found) throw new Error(`No ${kind} in the code`);
    return found;
  }

  it('accepts a function body', () => {
    const node = firstNodeOfKind(
      ['<?php', 'function save($user)', '{', '    return $user;', '}'],
      'block',
    );
    expect(isBlockNode(node)).toBe(true);
  });

  it('rejects the top level of the file', () => {
    const node = firstNodeOfKind(['<?php', '$rate = 0.2;'], 'program');
    expect(isBlockNode(node)).toBe(false);
  });

  it('rejects a class, which holds members', () => {
    const node = firstNodeOfKind(
      ['<?php', 'class Cart', '{', '    public $items = [];', '}'],
      'class',
    );
    expect(isBlockNode(node)).toBe(false);
  });

  it('rejects a block without its location', () => {
    const node = firstNodeOfKind(
      ['<?php', 'function save($user)', '{', '    return $user;', '}'],
      'block',
    );
    expect(isBlockNode({ ...node, loc: undefined })).toBe(false);
  });
});
