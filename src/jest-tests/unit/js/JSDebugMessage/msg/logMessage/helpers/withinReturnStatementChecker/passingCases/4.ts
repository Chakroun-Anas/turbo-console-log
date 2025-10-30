// Binary expression in return statement
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
};
