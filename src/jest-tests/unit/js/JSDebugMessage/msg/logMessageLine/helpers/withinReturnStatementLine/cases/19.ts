// Spread element in return
export default {
  name: 'spread element in return',
  fileExtension: '.ts',
  lines: [
    'function spreadArray(items) {',
    '  return [...items, "extra"];',
    '}',
  ],
  selectionLine: 1,
  variableName: 'items',
  expected: 1, // Before the return statement
};
