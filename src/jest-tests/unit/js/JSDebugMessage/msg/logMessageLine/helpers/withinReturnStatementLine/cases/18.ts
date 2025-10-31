// Type assertion expression in return
export default {
  name: 'type assertion expression in return',
  fileExtension: '.ts',
  lines: ['function getTyped(value) {', '  return value as string;', '}'],
  selectionLine: 1,
  variableName: 'value',
  expected: 1, // Before the return statement
};
