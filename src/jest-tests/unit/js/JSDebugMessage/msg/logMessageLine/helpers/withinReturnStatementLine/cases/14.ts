// Array literal expression in return
export default {
  name: 'array literal expression in return',
  fileExtension: '.ts',
  lines: ['function createArray(item) {', '  return [item, "default"];', '}'],
  selectionLine: 1,
  variableName: 'item',
  expected: 1, // Before the return statement
};
