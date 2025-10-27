// Simple return statement - log should go before the return
export default {
  name: 'simple return statement',
  fileExtension: '.ts',
  lines: ['function getName(person) {', '  return person.name;', '}'],
  selectionLine: 1, // Line with return statement
  variableName: 'person.name',
  expected: 1, // Same line as return statement (log goes before)
};
