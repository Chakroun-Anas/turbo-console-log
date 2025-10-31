// Function expression in return
export default {
  name: 'function expression in return',
  fileExtension: '.ts',
  lines: [
    'function createCallback(value) {',
    '  return function() { return value; };',
    '}',
  ],
  selectionLine: 1,
  variableName: 'value',
  expected: 1, // Before the return statement
};
