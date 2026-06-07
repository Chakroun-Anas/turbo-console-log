/**
 * WanderingExpression fallback — real-resolver behavior (no helper mocks).
 *
 * Regression for the bug where RHS forms that match no checker (parenthesized
 * expressions, dict/list/set/tuple literals) fall through to WanderingExpression
 * and were placed at `selectionLine + 1`. For a multi-line statement that drops
 * the log *inside* the statement (often invalid Python). The log must instead
 * land after the statement's true end.
 */
import { line } from '@/debug-message/python/PythonDebugMessage/msg/logMessageLine/logMessageLine';
import {
  PythonLogMessage,
  PythonLogMessageType,
} from '@/debug-message/python/PythonDebugMessage/msg/logMessage/pythonLogMessageTypes';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import { parseCode } from '@/debug-message/python/PythonDebugMessage/msg/python-parser-utils/parseCode';

const wandering: PythonLogMessage = {
  logMessageType: PythonLogMessageType.WanderingExpression,
};

function lineFor(lines: string[], selectionLine: number, selectedVar: string) {
  const doc = makeTextDocument(lines, 'test.py', 'python');
  const program = parseCode(doc);
  return line(program, doc, selectedVar, selectionLine, wandering);
}

describe('Python logMessageLine — WanderingExpression on multi-line statements', () => {
  it('inserts after a multi-line parenthesized assignment, not inside the parens', () => {
    const lines = [
      'def f():',
      '    http_error_msg = (',
      '        f"{x} error"',
      '    )',
      '    return http_error_msg',
    ];
    // assignment spans lines 1-3; log must go after the closing paren (line 4),
    // never line 2 (inside the parens -> syntax error)
    expect(lineFor(lines, 1, 'http_error_msg')).toBe(4);
  });

  it('inserts after a multi-line dict-literal assignment', () => {
    const lines = [
      'host_params = {',
      '    "scheme": scheme,',
      '    "host": host,',
      '}',
      'next_stmt = 1',
    ];
    expect(lineFor(lines, 0, 'host_params')).toBe(4);
  });

  it('inserts after a multi-line list-literal assignment', () => {
    const lines = ['proxy_keys = [', '    a,', '    b,', ']', 'proxy = None'];
    expect(lineFor(lines, 0, 'proxy_keys')).toBe(4);
  });

  it('inserts after a multi-line expression statement (call), not inside it', () => {
    // mirrors V7/V9: a variable selected inside a multi-line call expression
    const lines = [
      'def f():',
      '    result.append(',
      '        compute(x),',
      '    )',
      '    return result',
    ];
    expect(lineFor(lines, 2, 'x')).toBe(4);
  });

  it('still inserts on the next line for a single-line wandering expression', () => {
    const lines = ['do_something()', 'x = 1'];
    expect(lineFor(lines, 0, 'do_something')).toBe(1);
  });

  describe('header-bound variables → insert into the clause body', () => {
    it('with … as: inserts inside the with body, not after the block', () => {
      const lines = ['def f():', '    with open(p) as fh:', '        use(fh)'];
      // body statement `use(fh)` is line 2 — not line 3 (after the block)
      expect(lineFor(lines, 1, 'fh')).toBe(2);
    });

    it('except … as e: inserts inside the except body, not after try/except', () => {
      const lines = [
        'try:',
        '    risky()',
        'except ValueError as e:',
        '    handle(e)',
      ];
      // `e` is bound only in the except suite → log at line 3, never after (line 4)
      expect(lineFor(lines, 2, 'e')).toBe(3);
    });

    it('case pattern: inserts inside the case body, not after the match', () => {
      const lines = [
        'def f(cmd):',
        '    match cmd:',
        '        case [a]:',
        '            use(a)',
      ];
      // `a` is bound only in this case suite → log at line 3
      expect(lineFor(lines, 2, 'a')).toBe(3);
    });
  });

  describe('match subject → insert before the match (like a condition)', () => {
    it('logs the subject before the match block', () => {
      const lines = [
        'def f(cmd):',
        '    match cmd:',
        '        case [a]:',
        '            use(a)',
      ];
      // `cmd` exists before the match → log before it (line 1), not after the block
      expect(lineFor(lines, 1, 'cmd')).toBe(1);
    });
  });
});
