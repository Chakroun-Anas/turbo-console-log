// Block statement in arrow function
export default {
  name: 'block statement in arrow function',
  fileExtension: '.ts',
  lines: [
    'function createComplexHandler(value) {',
    '  return () => { return value; };',
    '}',
  ],
  selectionLine: 1,
  variableName: 'value',
  expected: 1, // Before the return statement
};
