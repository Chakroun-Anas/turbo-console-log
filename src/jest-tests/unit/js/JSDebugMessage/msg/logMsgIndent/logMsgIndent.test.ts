import { logMsgIndent } from '@/debug-message/js/JSDebugMessage/msg/logMsgIndent';
import { openTurboTextDocument } from '@/debug-message/js/JSDebugMessage/detectAll/TurboTextDocument';
import { msg } from '@/debug-message/js/JSDebugMessage/msg';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/makeTextDocument';
import { createMockTextEditorEdit } from '@/jest-tests/mocks/helpers/createMockTextEditorEdit';
import { extensionPropertiesMock } from '@/jest-tests/mocks/extensionPropertiesMock';

describe('logMsgIndent', () => {
  describe('basic indentation detection', () => {
    it('should return spaces from selected variable line when log line is beyond document', () => {
      const document = openTurboTextDocument(
        'function test() {\n' + '  const variable = 42;\n' + '}',
      );

      const result = logMsgIndent(document, 1, 10);

      expect(result).toBe('  ');
    });

    it('should return deeper indentation when log line has more spaces', () => {
      const document = openTurboTextDocument(
        'function test() {\n' +
          '  const variable = 42;\n' +
          '    // log line with more indentation\n' +
          '}',
      );

      const result = logMsgIndent(document, 1, 2);

      expect(result).toBe('    ');
    });

    it('should return selected variable indentation when it is deeper', () => {
      const document = openTurboTextDocument(
        'function test() {\n' +
          '    const variable = 42;\n' +
          '  // log line with less indentation\n' +
          '}',
      );

      const result = logMsgIndent(document, 1, 2);

      expect(result).toBe('    ');
    });
  });

  describe('mixed whitespace handling', () => {
    it('should handle tabs in selected variable line', () => {
      const document = openTurboTextDocument(
        'function test() {\n' + '\t\tconst variable = 42;\n' + '}',
      );

      const result = logMsgIndent(document, 1, 10);

      expect(result).toBe('\t\t');
    });

    it('should handle mixed spaces and tabs', () => {
      const document = openTurboTextDocument(
        'function test() {\n' +
          '\t  const variable = 42;\n' + // 3 characters
          '  \t// log line\n' + // 3 characters
          '}',
      );

      const result = logMsgIndent(document, 1, 2);

      expect(result).toBe('  \t'); // Returns log line since they're equal length but log line wins
    });

    it('should handle spaces vs tabs comparison by length', () => {
      const document = openTurboTextDocument(
        'function test() {\n' +
          '    const variable = 42;\n' + // 4 spaces
          '\t// log line\n' + // 1 tab
          '}',
      );

      const result = logMsgIndent(document, 1, 2);

      expect(result).toBe('    '); // 4 spaces > 1 tab in length
    });
  });

  describe('edge cases', () => {
    it('should handle zero indentation on both lines', () => {
      const document = openTurboTextDocument(
        'const variable = 42;\n' + '// log line',
      );

      const result = logMsgIndent(document, 0, 1);

      expect(result).toBe('');
    });

    it('should handle empty selected variable line', () => {
      const document = openTurboTextDocument('\n  // log line');

      const result = logMsgIndent(document, 0, 1);

      expect(result).toBe('  ');
    });

    it('should handle empty log message line', () => {
      const document = openTurboTextDocument('  const variable = 42;\n');

      const result = logMsgIndent(document, 0, 1);

      expect(result).toBe('  ');
    });

    it('should handle line with only whitespace', () => {
      const document = openTurboTextDocument('  const variable = 42;\n    ');

      const result = logMsgIndent(document, 0, 1);

      expect(result).toBe('    ');
    });
  });

  describe('line boundary scenarios', () => {
    it('should handle log line at document boundary', () => {
      const document = openTurboTextDocument(
        '  const variable = 42;\n' + '    const another = 24;',
      );

      const result = logMsgIndent(document, 0, 1);

      expect(result).toBe('    ');
    });

    it('should handle last line as log line', () => {
      const document = openTurboTextDocument(
        '  const variable = 42;\n' +
          '  const another = 24;\n' +
          '    // last line',
      );

      const result = logMsgIndent(document, 0, 2);

      expect(result).toBe('    ');
    });

    it('should handle same line numbers for variable and log', () => {
      const document = openTurboTextDocument('    const variable = 42;');

      const result = logMsgIndent(document, 0, 0);

      expect(result).toBe('    ');
    });
  });

  describe('complex indentation patterns', () => {
    it('should handle nested function indentation', () => {
      const document = openTurboTextDocument(
        'function outer() {\n' +
          '  function inner() {\n' +
          '    const variable = 42;\n' +
          '      // deeply nested log line\n' +
          '  }\n' +
          '}',
      );

      const result = logMsgIndent(document, 2, 3);

      expect(result).toBe('      ');
    });

    it('should handle class method indentation', () => {
      const document = openTurboTextDocument(
        'class MyClass {\n' +
          '  method() {\n' +
          '    const variable = 42;\n' +
          '  }\n' +
          '}',
      );

      const result = logMsgIndent(document, 2, 10);

      expect(result).toBe('    ');
    });
  });

  describe('real-world scenarios', () => {
    it('should handle JavaScript object literal', () => {
      const document = openTurboTextDocument(
        'const config = {\n' +
          '  setting: value,\n' +
          '    // comment with more indentation\n' +
          '  another: setting\n' +
          '};',
      );

      const result = logMsgIndent(document, 1, 2);

      expect(result).toBe('    ');
    });

    it('should handle if statement block', () => {
      const document = openTurboTextDocument(
        'if (condition) {\n' +
          '  const variable = getValue();\n' +
          '  // log message here\n' +
          '}',
      );

      const result = logMsgIndent(document, 1, 2);

      expect(result).toBe('  ');
    });
  });
});

describe('logMsgIndent when inserting a log', () => {
  function indentFor(
    lines: string[],
    selectedVarLine: number,
    logMsgLine: number,
    { tabSize = 2, fileExtension = '.ts' } = {},
  ): string {
    const document = makeTextDocument(lines);
    const ast = parseCode(document.getText(), fileExtension, selectedVarLine);
    return logMsgIndent(document, selectedVarLine, logMsgLine, {
      ast,
      tabSize,
    });
  }

  const userCard = [
    'function UserCard({ user, onSelect }) {',
    '  return (',
    '    <Profile',
    '      name={user.name}',
    '      avatar={user.avatar}',
    '      onClick={() => onSelect(user.id)}',
    '    />',
    '  );',
    '}',
  ];
  const sendWelcomeEmail = [
    'export async function sendWelcomeEmail(user) {',
    '  try {',
    '    await mailer.send(user.email, welcomeTemplate(user));',
    '  } catch (err) {',
    '  }',
    '}',
  ];

  describe('selected line deeper than its statement', () => {
    it('uses the statement indent for a prop of a returned JSX element', () => {
      expect(indentFor(userCard, 4, 1, { fileExtension: '.jsx' })).toBe('  ');
    });

    it('uses the statement indent for a multi-line destructuring followed by a statement', () => {
      const lines = [
        'function show(props) {',
        '  const {',
        '    first,',
        '    second,',
        '  } = props;',
        '  return first;',
        '}',
      ];
      expect(indentFor(lines, 2, 5)).toBe('  ');
    });

    it('uses the statement indent for a multi-line destructuring closing its block', () => {
      const lines = [
        'function show(props) {',
        '  const {',
        '    first,',
        '  } = props;',
        '}',
      ];
      expect(indentFor(lines, 2, 4)).toBe('  ');
    });

    it('uses the statement indent for a call argument', () => {
      const lines = [
        'function register(user) {',
        '  const saved = save(',
        '    user.name,',
        '  );',
        '  return saved;',
        '}',
      ];
      expect(indentFor(lines, 2, 4)).toBe('  ');
    });

    it('uses the statement indent for an array item', () => {
      const lines = [
        'const list = [',
        '  first,',
        '  second,',
        '];',
        'run(list);',
      ];
      expect(indentFor(lines, 1, 4)).toBe('');
    });

    it('uses the statement indent for a value in a returned object', () => {
      const lines = [
        'function build(input) {',
        '  return {',
        '    value: input.value * 2,',
        '  };',
        '}',
      ];
      expect(indentFor(lines, 2, 1)).toBe('  ');
    });

    it('uses the statement indent for a chained call', () => {
      const lines = [
        'function load(query) {',
        '  const rows = query',
        '    .where(query.id)',
        '    .all();',
        '  return rows;',
        '}',
      ];
      expect(indentFor(lines, 2, 4)).toBe('  ');
    });

    it('uses the body indent for a parameter aligned with the first one', () => {
      const lines = [
        'function join(first,',
        '              second) {',
        '  return first + second;',
        '}',
      ];
      expect(indentFor(lines, 1, 2)).toBe('  ');
    });

    it('still uses the selected line when it starts its statement', () => {
      const lines = ['function f() {', '  const a = 1;', '  return a;', '}'];
      expect(indentFor(lines, 1, 2)).toBe('  ');
    });

    it('still indents into the body for a parameter', () => {
      const lines = ['function f(a) {', '  return a;', '}'];
      expect(indentFor(lines, 0, 1)).toBe('  ');
    });

    it('still keeps the member indent for the last field of a class', () => {
      const lines = ['class Store {', '  items = load(1);', '}'];
      expect(indentFor(lines, 1, 2)).toBe('  ');
    });

    it('still keeps the case body indent before the next case', () => {
      const lines = [
        'switch (kind) {',
        '  case 1:',
        '    run(value);',
        '  case 2:',
        '    stop();',
        '}',
      ];
      expect(indentFor(lines, 2, 3)).toBe('    ');
    });
  });

  describe('no indent to copy from', () => {
    it('goes one level deeper than the catch for an empty catch block', () => {
      expect(indentFor(sendWelcomeEmail, 3, 4)).toBe('    ');
    });

    it('goes one level deeper for an empty function over two lines', () => {
      expect(indentFor(['function f(a) {', '}'], 0, 1)).toBe('  ');
    });

    it('goes one level deeper for an empty method, with the editor tab size', () => {
      const lines = ['class A {', '    run(a) {', '    }', '}'];
      expect(indentFor(lines, 1, 2, { tabSize: 4 })).toBe('        ');
    });

    it('goes one level deeper for an empty arrow function', () => {
      expect(indentFor(['const f = (a) => {', '};'], 0, 1)).toBe('  ');
    });

    it('goes one level deeper for an empty loop', () => {
      const lines = ['function f(xs) {', '  for (const x of xs) {', '  }', '}'];
      expect(indentFor(lines, 1, 2)).toBe('    ');
    });

    it('goes one level deeper for an empty block with a blank first line', () => {
      expect(indentFor(['function f(a) {', '', '}'], 0, 1)).toBe('  ');
    });

    it('copies the first statement when the first line of the block is blank', () => {
      const lines = ['function f(a) {', '', '    return a;', '}'];
      expect(indentFor(lines, 0, 1)).toBe('    ');
    });

    it('adds a tab in a tab-indented block', () => {
      const lines = [
        'function f() {',
        '\ttry {',
        '\t\trun();',
        '\t} catch (err) {',
        '\t}',
        '}',
      ];
      expect(indentFor(lines, 3, 4)).toBe('\t\t');
    });

    it('adds a tab for an empty function at column 0 of a tab-indented file', () => {
      const lines = [
        'function a() {',
        '\treturn 1;',
        '}',
        'function f(b) {',
        '}',
      ];
      expect(indentFor(lines, 3, 4)).toBe('\t');
    });

    it('still copies a comment that opens the block', () => {
      const lines = [
        'try {',
        '  run();',
        '} catch (err) {',
        '  // ignored',
        '}',
      ];
      expect(indentFor(lines, 2, 3)).toBe('  ');
    });
  });

  describe('through the insert command', () => {
    function insertion(
      lines: string[],
      selectedVar: string,
      selectedVarLine: number,
      fileName: string,
    ): { line: number; text: string } {
      const textEditor = createMockTextEditorEdit();
      msg(
        textEditor,
        makeTextDocument(lines, fileName),
        selectedVar,
        selectedVarLine,
        2,
        extensionPropertiesMock,
        'log',
      );
      const [position, text] = (textEditor.insert as jest.Mock).mock.calls[0];
      return { line: position.line, text };
    }

    it('logs a prop of a returned JSX element at the indent of the return', () => {
      const { line, text } = insertion(
        userCard,
        'user.avatar',
        4,
        'UserCard.jsx',
      );
      expect(line).toBe(1);
      expect(text).toMatch(/^ {2}console\.log\(/);
    });

    it('logs the error of an empty catch one level deeper than the catch', () => {
      const { line, text } = insertion(
        sendWelcomeEmail,
        'err',
        3,
        'sendWelcomeEmail.ts',
      );
      expect(line).toBe(4);
      expect(text).toMatch(/^ {4}console\.log\(/);
    });
  });
});
