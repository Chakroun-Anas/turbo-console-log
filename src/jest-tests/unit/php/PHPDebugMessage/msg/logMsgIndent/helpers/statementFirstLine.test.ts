import { statementFirstLine } from '@/debug-message/php/PHPDebugMessage/msg/logMsgIndent/helpers';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import { getPhpParser } from '@/jest-tests/mocks/helpers';

describe('statementFirstLine', () => {
  const orderService = parseCode(
    [
      '<?php', // 0
      '', // 1
      'class OrderService', // 2
      '{', // 3
      '    public function forUser($userId)', // 4
      '    {', // 5
      '        $orders = Order::query()', // 6
      "            ->where('user_id', $userId)", // 7
      '            ->get();', // 8
      '', // 9
      '        return $orders;', // 10
      '    }', // 11
      '}', // 12
    ].join('\n'),
    getPhpParser(),
  );

  it('returns the line itself when a statement starts there', () => {
    expect(statementFirstLine(orderService, 6)).toBe(6);
    expect(statementFirstLine(orderService, 10)).toBe(10);
  });

  it('returns the first line of the statement for a continuation line', () => {
    expect(statementFirstLine(orderService, 7)).toBe(6);
    expect(statementFirstLine(orderService, 8)).toBe(6);
  });

  it('returns the method for a line of its signature or its opening brace', () => {
    expect(statementFirstLine(orderService, 4)).toBe(4);
    expect(statementFirstLine(orderService, 5)).toBe(4);
  });

  it('ignores the statements of another function', () => {
    const ast = parseCode(
      [
        '<?php', // 0
        'function price($item)', // 1
        '{', // 2
        '    return $item->price;', // 3
        '}', // 4
        'function tax($item)', // 5
        '{', // 6
        '    return $item->price * 0.2;', // 7
        '}', // 8
      ].join('\n'),
      getPhpParser(),
    );
    expect(statementFirstLine(ast, 3)).toBe(3);
  });

  it('returns undefined for a line outside any statement', () => {
    expect(statementFirstLine(orderService, 0)).toBeUndefined();
  });
});
