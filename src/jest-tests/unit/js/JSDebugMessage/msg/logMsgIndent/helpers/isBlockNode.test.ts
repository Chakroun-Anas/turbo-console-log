import { isBlockNode } from '@/debug-message/js/JSDebugMessage/msg/logMsgIndent/helpers';
import {
  parseCode,
  walk,
} from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import type { AcornNode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils/types';

describe('isBlockNode', () => {
  function firstNodeOfType(lines: string[], type: string): AcornNode {
    const ast = parseCode(lines.join('\n'), '.ts', 0);
    let found: AcornNode | undefined;
    walk(ast, (node) => {
      if (!found && node.type === type) found = node;
    });
    if (!found) throw new Error(`No ${type} in the code`);
    return found;
  }

  it('accepts a function body', () => {
    const node = firstNodeOfType(
      ['function save(user) {', '  return db.save(user);', '}'],
      'BlockStatement',
    );
    expect(isBlockNode(node)).toBe(true);
  });

  it('accepts a class static block', () => {
    const node = firstNodeOfType(
      ['class Config {', '  static {', '    Config.load();', '  }', '}'],
      'StaticBlock',
    );
    expect(isBlockNode(node)).toBe(true);
  });

  it('accepts a namespace body', () => {
    const node = firstNodeOfType(
      ['namespace Billing {', '  export const rate = 0.2;', '}'],
      'TSModuleBlock',
    );
    expect(isBlockNode(node)).toBe(true);
  });

  it('rejects the top level of the file', () => {
    const node = firstNodeOfType(['const rate = 0.2;'], 'Program');
    expect(isBlockNode(node)).toBe(false);
  });

  it('rejects a class body, which holds members', () => {
    const node = firstNodeOfType(
      ['class Cart {', '  items = [];', '}'],
      'ClassBody',
    );
    expect(isBlockNode(node)).toBe(false);
  });

  it('rejects a block without its location', () => {
    const node = firstNodeOfType(
      ['function save(user) {', '  return db.save(user);', '}'],
      'BlockStatement',
    );
    expect(isBlockNode({ ...node, loc: null })).toBe(false);
  });

  it('rejects a case without braces', () => {
    const node = firstNodeOfType(
      [
        'switch (action.type) {',
        "  case 'add':",
        '    add(action.payload);',
        '    break;',
        '}',
      ],
      'SwitchCase',
    );
    expect(isBlockNode(node)).toBe(false);
  });
});
