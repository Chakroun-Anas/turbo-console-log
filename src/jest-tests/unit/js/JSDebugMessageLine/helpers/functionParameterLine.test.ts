import { functionParameterLine } from '@/debug-message/js/JSDebugMessageLine/helpers';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';

describe('functionParameterLine – basic cases', () => {
  it('should return the correct insertion line for various layouts', () => {
    const documents = [
      {
        // brace at end of declaration line
        lines: ['function greet(name) {', '  return name;', '}'],
        selectionLine: 0,
        variableName: 'name',
        expected: 1,
      },
      {
        // arrow function block
        lines: ['const greet = (name) => {', '  return name', '};'],
        selectionLine: 0,
        variableName: 'name',
        expected: 1,
      },
      {
        // brace on its own line
        lines: ['function greet(name)', '{', '  return name', '}'],
        selectionLine: 0,
        variableName: 'name',
        expected: 2,
      },
      {
        // inline empty function
        lines: ['function noop(name) {}'],
        selectionLine: 0,
        variableName: 'name',
        expected: 0, // log should stay on same line
      },
      {
        // concise arrow without block
        lines: ['const double = (x) => x * 2;'],
        selectionLine: 0,
        variableName: 'x',
        expected: 1, // fallback behavior
      },
      {
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
        expected: 5, // brace is on line 4 and ends with `{` → insert on line 5
      },
      {
        lines: [
          'function outer(data) {', // 0
          '  function inner(data) {', // 1
          '    return data;', // 2
          '  }', // 3
          '  return inner(data);', // 4
          '}', // 5
        ],
        selectionLine: 0,
        variableName: 'data',
        expected: 1, // insert after outer block starts (line 0 ends with `{`)
      },
      {
        lines: ['const Hello = ({ name }) => <div>Hello {name}</div>;'],
        selectionLine: 0,
        variableName: 'name',
        expected: 1, // no block, so fallback applies
      },
      {
        lines: [
          'class Controller {', // 0
          '  handleSubmit({ user: { id, email } }) {', // 1
          '    return email;', // 2
          '  }', // 3
          '}', // 4
        ],
        selectionLine: 1,
        variableName: 'email',
        expected: 2, // brace ends line 1, so we expect insertion on line 2
      },
    ];

    for (const doc of documents) {
      const textDoc = makeTextDocument(doc.lines);
      const insertionLine = functionParameterLine(
        textDoc,
        doc.selectionLine,
        doc.variableName,
      );
      expect(insertionLine).toBe(doc.expected);
    }
  });
});
