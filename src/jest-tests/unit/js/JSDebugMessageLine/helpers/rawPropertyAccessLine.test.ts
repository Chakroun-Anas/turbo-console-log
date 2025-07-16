import { rawPropertyAccessLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/rawPropertyAccessLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

describe('rawPropertyAccessLine', () => {
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
      variableName: 'age',
      expectedLine: 4,
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
      variableName: 'mother',
      expectedLine: 8,
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
      variableName: 'firstName',
      expectedLine: 8,
    },
  ];

  for (const test of testCases) {
    it(`should return correct insertion line – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const result = rawPropertyAccessLine(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result).toBe(test.expectedLine);
    });
  }
});
