import { functionParameterChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

describe('functionParameterChecker - basic cases', () => {
  it('should detect a simple named parameter in a function declaration', () => {
    const documents = [
      {
        lines: ['function greet(name: string) {', '  console.log(name);', '}'],
        selectionLine: 0,
        variableName: 'name',
      },
      {
        lines: [
          'const x: number = 7;',
          'const handleSubmit = ({ user, email }) => {',
          '  console.log(user, email);',
          '};',
        ],
        selectionLine: 1,
        variableName: 'email',
      },
      {
        lines: [
          'const processData = ([, second, third]) => {',
          '  console.log(second, third);',
          '};',
        ],
        selectionLine: 0,
        variableName: 'second',
      },
      {
        lines: [
          'const handleInit = ({ config: { apiKey, region } }) => {',
          '  console.log(apiKey);',
          '};',
        ],
        selectionLine: 0,
        variableName: 'apiKey',
      },
      {
        lines: [
          'const login = ({ username = "guest" }) => {',
          '  console.log(username);',
          '};',
        ],
        selectionLine: 0,
        variableName: 'username',
      },
      {
        lines: [
          'const handler = function (event) {',
          '  console.log(event);',
          '};',
        ],
        selectionLine: 0,
        variableName: 'event',
      },
      {
        lines: [
          'function saveUser(',
          '  id: number,',
          '  user: { name: string; email: string },',
          ') {',
          '  console.log(user);',
          '}',
        ],
        selectionLine: 2,
        variableName: 'user',
      },
      {
        lines: ['const sum = (...numbers) => numbers.reduce((a,b)=>a+b,0);'],
        selectionLine: 0,
        variableName: 'numbers',
      },
      {
        lines: [
          'const init = ([first = 1, second]) => {',
          '  console.log(first, second);',
          '};',
        ],
        selectionLine: 0,
        variableName: 'second',
      },
      {
        lines: ['const dig = ([[id]]) => {', '  console.log(id);', '};'],
        selectionLine: 0,
        variableName: 'id',
      },
    ];
    for (const document of documents) {
      const textDocument = makeTextDocument(document.lines);
      const result = functionParameterChecker(
        textDocument,
        document.selectionLine,
        document.variableName,
      );
      expect(result.isChecked).toBe(true);
    }
  });
});
