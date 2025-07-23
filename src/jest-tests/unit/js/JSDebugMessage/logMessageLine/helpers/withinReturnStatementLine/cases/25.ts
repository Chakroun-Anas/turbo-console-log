// Recursive child node checking
export default {
  name: 'recursive child node checking',
  lines: [
    'function deepNested(value) {',
    '  return { nested: { deep: { value } } };',
    '}',
  ],
  selectionLine: 1,
  variableName: 'value',
  expected: 1, // Before the return statement
};
