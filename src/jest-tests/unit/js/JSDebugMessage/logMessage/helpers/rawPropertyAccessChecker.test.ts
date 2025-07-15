import { rawPropertyAccessChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/rawPropertyAccessChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

describe('rawPropertyAccessChecker', () => {
  const testCases = [
    {
      name: 'one-level property access (person.age)',
      lines: [
        'const person = {',
        "    firstName: 'Anas',",
        '    age: 28,',
        '};',
      ],
      selectionLine: 2,
      selectedText: 'age',
      expected: true,
      deepObjectPath: 'person.age',
    },
    {
      name: 'two-level property access (person.family.mother)',
      lines: [
        'const person = {',
        "    firstName: 'Anas',",
        '    family: {',
        '        mother: {',
        "            firstName: 'Rkia',",
        '        }',
        '    }',
        '};',
      ],
      selectionLine: 3,
      selectedText: 'mother',
      expected: true,
      deepObjectPath: 'person.family.mother',
    },
    {
      name: 'three-level property access (person.family.mother.firstName)',
      lines: [
        'const person = {',
        "    firstName: 'Anas',",
        '    family: {',
        '        mother: {',
        "            firstName: 'Rkia',",
        '        }',
        '    }',
        '};',
      ],
      selectionLine: 4,
      selectedText: 'firstName',
      expected: true,
      deepObjectPath: 'person.family.mother.firstName',
    },
  ];

  for (const test of testCases) {
    it(`should ${test.expected ? 'detect' : 'not detect'} property access – ${test.name}`, () => {
      const document = makeTextDocument(test.lines);
      const result = rawPropertyAccessChecker(
        document,
        test.selectionLine,
        test.selectedText,
      );
      expect(result.isChecked).toBe(test.expected);
      expect(result?.metadata?.deepObjectPath).toBe(test.deepObjectPath);
    });
  }
});
