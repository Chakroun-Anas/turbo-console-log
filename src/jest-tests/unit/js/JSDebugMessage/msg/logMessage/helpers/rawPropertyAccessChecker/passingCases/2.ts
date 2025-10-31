export default {
  name: 'two-level property access (person.family.mother)',
  fileExtension: '.ts',
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
  deepObjectPath: 'person.family.mother',
};
