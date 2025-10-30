import { enclosingBlockName } from '@/debug-message/js/JSDebugMessage/enclosingBlockName/enclosingBlockName';
import { BlockType } from '@/entities';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

describe('enclosingBlockName', () => {
  describe('destructured parameters regression test', () => {
    it('should not hang on arrow function with destructured parameters in JSX', () => {
      const document = makeTextDocument([
        '// @ts-nocheck',
        '',
        'export function FancyComponent({',
        '  importantProp,',
        '}: FancyComponentProps): JSX.Element {',
        '  const someContext = React.useContext(GreatContext);',
        '  return (',
        '    <SomeComponent',
        '      isGreat',
        '      steps={steps.map(({ step, name, stepFields }) => {',
        '        return {',
        '          name,',
        '          step,',
        '          allowNext: stepFields.every(({ name, isRequired }) => {',
        '            return (',
        '              !isRequired ||',
        '              (!!formContext?.watch(name) && !formContext?.errors?.[name])',
        '            );',
        '          }),',
        '        };',
        '      })}',
        '    />',
        '  );',
        '}',
      ]);
      // Line 13 corresponds to the stepFields.every arrow function
      // This should not hang and should return the enclosing function name
      const selectionLine = 13;
      const ast = parseCode(document.getText(), '.tsx', selectionLine)!;
      const result = enclosingBlockName(
        ast,
        document,
        selectionLine,
        'function' as BlockType,
      );
      expect(result).toBe('FancyComponent');
    });
  });
  const passingCases = [
    {
      name: 'inside named function',
      lines: ['function greet() {', '  const name = "Anas";', '}'],
      selectionLine: 1,
      expectedName: 'greet',
      blockType: 'function',
    },
    {
      name: 'inside arrow function assigned to variable',
      lines: ['const log = () => {', '  const msg = "Turbo";', '};'],
      selectionLine: 1,
      expectedName: 'log',
      blockType: 'function',
    },
    {
      name: 'inside class block',
      lines: [
        'class Developer {',
        '  code() {',
        '    const lines = 100;',
        '  }',
        '}',
      ],
      selectionLine: 2,
      expectedName: 'Developer',
      blockType: 'class',
    },
    {
      name: 'inside method of a class',
      lines: [
        'class Turbo {',
        '  build() {',
        '    const speed = "fast";',
        '  }',
        '}',
      ],
      selectionLine: 2,
      expectedName: 'build',
      blockType: 'function',
    },
    {
      name: 'inside class constructor method',
      lines: [
        'class Person {',
        '  constructor(fullName) {',
        '    this.fullName = fullName;',
        '  }',
        '}',
      ],
      selectionLine: 1,
      expectedName: 'constructor',
      blockType: 'function',
    },
    {
      name: 'nested functions – should pick innermost',
      lines: [
        'class Person {',
        '  someFunction(firstParam) {',
        '    function anotherFunction(anotherParam) {',
        '      return anotherParam;',
        '    }',
        '  }',
        '}',
      ],
      selectionLine: 2,
      expectedName: 'anotherFunction',
      blockType: 'function',
    },
  ];

  const failingCases = [
    {
      name: 'outside any function or class',
      lines: ['const hello = "world";'],
      selectionLine: 0,
      expectedName: '',
      blockType: 'function',
    },
    {
      name: 'variable outside class block',
      lines: ['class Whatever {}', '', 'const thing = true;'],
      selectionLine: 2,
      expectedName: '',
      blockType: 'class',
    },
  ];

  for (const testCase of passingCases) {
    it(`should detect enclosing ${testCase.blockType} – ${testCase.name}`, () => {
      const document = makeTextDocument(testCase.lines);
      const ast = parseCode(document.getText(), 'ts', testCase.selectionLine)!;
      const result = enclosingBlockName(
        ast,
        document,
        testCase.selectionLine,
        testCase.blockType as BlockType,
      );
      expect(result).toBe(testCase.expectedName);
    });
  }

  for (const testCase of failingCases) {
    it(`should return empty string when no enclosing ${testCase.blockType} – ${testCase.name}`, () => {
      const document = makeTextDocument(testCase.lines);
      const ast = parseCode(document.getText(), '.ts', testCase.selectionLine)!;
      const result = enclosingBlockName(
        ast,
        document,
        testCase.selectionLine,
        testCase.blockType as BlockType,
      );
      expect(result).toBe('');
    });
  }
});
