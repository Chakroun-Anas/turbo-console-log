import { functionParameterLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';

const testCases = [
  {
    name: 'brace at end of declaration line',
    lines: ['function greet(name) {', '  return name;', '}'],
    selectionLine: 0,
    variableName: 'name',
    expected: 1,
  },
  {
    name: 'arrow function block',
    lines: ['const greet = (name) => {', '  return name', '};'],
    selectionLine: 0,
    variableName: 'name',
    expected: 1,
  },
  {
    name: 'brace on its own line',
    lines: ['function greet(name)', '{', '  return name', '}'],
    selectionLine: 0,
    variableName: 'name',
    expected: 2,
  },
  {
    name: 'inline empty function',
    lines: ['function noop(name) {}'],
    selectionLine: 0,
    variableName: 'name',
    expected: 1,
  },
  {
    name: 'concise arrow without block',
    lines: ['const double = (x) => x * 2;'],
    selectionLine: 0,
    variableName: 'x',
    expected: 1,
  },
  {
    name: 'destructured props in arrow component',
    lines: [
      'const MyComponent = ({',
      '  title,',
      '  subtitle,',
      '  onClick',
      '}) => {',
      '  return <div onClick={onClick}>{title}</div>;',
      '};',
    ],
    selectionLine: 3,
    variableName: 'onClick',
    expected: 5,
  },
  {
    name: 'multi-line typed function declaration',
    lines: [
      'function fetchData(',
      '  url: string,',
      '  method: "GET" | "POST",',
      '  headers?: Record<string, string>',
      ') {',
      '  return fetch(url);',
      '}',
    ],
    selectionLine: 3,
    variableName: 'headers',
    expected: 5,
  },
  {
    name: 'nested functions with same param name',
    lines: [
      'function outer(data) {',
      '  function inner(data) {',
      '    return data;',
      '  }',
      '  return inner(data);',
      '}',
    ],
    selectionLine: 0,
    variableName: 'data',
    expected: 1,
  },
  {
    name: 'inline arrow component without block',
    lines: ['const Hello = ({ name }) => <div>Hello {name}</div>;'],
    selectionLine: 0,
    variableName: 'name',
    expected: 1,
  },
  {
    name: 'nested destructuring inside method',
    lines: [
      'class Controller {',
      '  handleSubmit({ user: { id, email } }) {',
      '    return email;',
      '  }',
      '}',
    ],
    selectionLine: 1,
    variableName: 'email',
    expected: 2,
  },
];

describe('functionParameterLine – each layout style', () => {
  for (const test of testCases) {
    it(`should return correct insertion line for: ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const result = functionParameterLine(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result).toBe(test.expected);
    });
  }
});
