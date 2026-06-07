import { spacesBeforeLogMsg } from '@/debug-message/python/PythonDebugMessage/msg/spacesBeforeLogMsg/spacesBeforeLogMsg';
import { parseCode } from '@/debug-message/python/PythonDebugMessage/msg/python-parser-utils/parseCode';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

function indentFor(
  lines: string[],
  selectedVarLine: number,
  logMsgLine: number,
): string {
  const doc = makeTextDocument(lines, 'test.py', 'python');
  const program = parseCode(doc);
  return spacesBeforeLogMsg(program, doc, selectedVarLine, logMsgLine);
}

describe('Python spacesBeforeLogMsg', () => {
  it('uses the statement first-line indent, not a continuation line (multi-line return)', () => {
    // Regression: selecting `content` on the continuation line (8 spaces) must
    // not over-indent the log inserted before the `return` (4 spaces).
    const lines = [
      'def f():',
      '    return (',
      '        charset_re.findall(content)',
      '        + xml_re.findall(content)',
      '    )',
    ];
    expect(indentFor(lines, 2, 1)).toBe('    ');
  });

  it('uses the statement first-line indent for a multi-line assignment (continuation selected)', () => {
    const lines = ['x = merge(', '    a,', '    b,', ')', 'y = 1'];
    // select continuation 'a,' (line 1); log inserted after the close paren (line 4)
    expect(indentFor(lines, 1, 4)).toBe('');
  });

  it('indents into the body for a function-parameter log (deeper than the def line)', () => {
    const lines = ['def process(data):', '    result = data'];
    expect(indentFor(lines, 0, 1)).toBe('    ');
  });

  it('matches the statement indentation for a simple single-line case', () => {
    const lines = ['def f():', '    x = compute()', '    return x'];
    expect(indentFor(lines, 1, 2)).toBe('    ');
  });

  it('keeps the deeper indentation when the log line is more indented', () => {
    const lines = ['if cond:', '    do_thing()'];
    expect(indentFor(lines, 0, 1)).toBe('    ');
  });
});
