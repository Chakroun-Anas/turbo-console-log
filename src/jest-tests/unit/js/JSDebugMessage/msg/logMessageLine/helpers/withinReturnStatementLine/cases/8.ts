// Function call in return statement
export default {
  name: 'function call in return',
  lines: [
    'function processData(data) {',
    '  return transform(data.value);',
    '}',
  ],
  selectionLine: 1,
  variableName: 'data.value',
  expected: 1, // Before the return statement
};
