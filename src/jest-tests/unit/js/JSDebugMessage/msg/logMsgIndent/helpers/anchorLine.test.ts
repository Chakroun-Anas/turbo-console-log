import { anchorLine } from '@/debug-message/js/JSDebugMessage/msg/logMsgIndent/helpers';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';

describe('anchorLine', () => {
  function anchorFor(lines: string[], selectedVarLine: number): number {
    const ast = parseCode(lines.join('\n'), '.ts', selectedVarLine);
    return anchorLine(ast, selectedVarLine);
  }

  it('returns the selected line when it starts its statement', () => {
    const lines = [
      'function f() {', // 0
      '  const a = 1;', // 1
      '  return a;', // 2
      '}', // 3
    ];
    expect(anchorFor(lines, 1)).toBe(1);
  });

  it('returns the first line of the statement for a continuation line', () => {
    const lines = [
      'function show(props) {', // 0
      '  const {', // 1
      '    first,', // 2
      '  } = props;', // 3
      '  return first;', // 4
      '}', // 5
    ];
    expect(anchorFor(lines, 2)).toBe(1);
  });

  it('returns the first line of the innermost statement, not of the ones around it', () => {
    const lines = [
      'function pay(items) {', // 0
      '  if (items) {', // 1
      '    const total = sum(', // 2
      '      items,', // 3
      '    );', // 4
      '    charge(total);', // 5
      '  }', // 6
      '}', // 7
    ];
    expect(anchorFor(lines, 3)).toBe(2);
  });

  it('returns the first line of a function for a parameter on its second line', () => {
    const lines = [
      'function join(first,', // 0
      '              second) {', // 1
      '  return first + second;', // 2
      '}', // 3
    ];
    expect(anchorFor(lines, 1)).toBe(0);
  });

  it('keeps the selected line when no statement holds it', () => {
    const lines = [
      'import {', // 0
      '  first,', // 1
      '  second,', // 2
      "} from './numbers';", // 3
      'run(first);', // 4
    ];
    expect(anchorFor(lines, 1)).toBe(1);
  });
});
