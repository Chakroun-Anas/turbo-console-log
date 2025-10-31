// Position-based matching for complex expressions
export default {
  name: 'position-based complex expression',
  fileExtension: '.ts',
  lines: [
    'function complexCalculation(a, b) {',
    '  return a * b + (a - b);',
    '}',
  ],
  selectionLine: 1,
  variableName: 'a * b + (a - b)', // Complex expression that requires position-based matching
  expected: 1, // Before the return statement
};
