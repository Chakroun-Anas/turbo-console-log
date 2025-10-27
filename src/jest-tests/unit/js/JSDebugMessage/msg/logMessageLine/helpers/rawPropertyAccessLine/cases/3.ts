export default {
  fileExtension: '.ts',
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
};
