// Binary expression in return
export default {
  name: 'binary expression in return',
  fileExtension: '.ts',
  lines: [
    'function getFullName(person) {',
    '  return person.firstName + " " + person.lastName;',
    '}',
  ],
  selectionLine: 1,
  variableName: 'person.firstName',
  expected: 1, // Before the return statement
};
