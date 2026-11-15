import { innermostNode } from '@/debug-message/js/JSDebugMessage/msg/logMsgIndent/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import type { AcornNode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils/types';

describe('innermostNode', () => {
  const checkout = parseCode(
    [
      'function checkout(cart) {',
      '  const count = cart.items.length;',
      '  if (count) {',
      '    const total = sum(',
      '      cart.items,',
      '    );',
      '    pay(total);',
      '  }',
      '}',
      'function refund(order) {',
      '  const total = order.total;',
      '  return total;',
      '}',
    ].join('\n'),
    '.ts',
    0,
  );
  const covering =
    (line: number) =>
    (first: number, last: number): boolean =>
      first <= line && line <= last;
  const firstLineOf = (node: AcornNode | undefined): number | undefined =>
    node?.loc ? node.loc.start.line - 1 : undefined;

  it('returns the innermost node of the given types covering the lines', () => {
    const node = innermostNode(
      checkout,
      new Set(['FunctionDeclaration', 'IfStatement', 'VariableDeclaration']),
      covering(4),
    );
    expect(node?.type).toBe('VariableDeclaration');
    expect(firstLineOf(node)).toBe(3);
  });

  it('skips nodes of other types', () => {
    const node = innermostNode(checkout, new Set(['IfStatement']), covering(4));
    expect(node?.type).toBe('IfStatement');
    expect(firstLineOf(node)).toBe(2);
  });

  it('ignores a node of the same type elsewhere in the file', () => {
    const node = innermostNode(
      checkout,
      new Set(['VariableDeclaration']),
      covering(4),
    );
    expect(firstLineOf(node)).toBe(3);
  });

  it('reads the lines of each node from 0', () => {
    const node = innermostNode(
      checkout,
      new Set(['FunctionDeclaration']),
      covering(9),
    );
    expect(firstLineOf(node)).toBe(9);
  });

  it('returns undefined when no node of the given types covers the lines', () => {
    const node = innermostNode(
      checkout,
      new Set(['VariableDeclaration']),
      covering(6),
    );
    expect(node).toBeUndefined();
  });
});
