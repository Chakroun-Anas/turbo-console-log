export default {
  name: 'three-level property access (person.family.mother.firstName)',
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
  selectionLine: 4,
  selectedText: 'firstName',
  deepObjectPath: 'person.family.mother.firstName',
};
