export default {
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
};
