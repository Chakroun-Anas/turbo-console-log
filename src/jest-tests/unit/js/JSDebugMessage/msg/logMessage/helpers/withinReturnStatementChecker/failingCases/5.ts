// Empty variable name
export default {
  name: 'empty variable name',
  fileExtension: '.ts',
  lines: ['function getName(person) {', '  return person.name;', '}'],
  selectionLine: 1,
  variableName: '', // Empty string should return false
};
