// Parenthesized expression in return
export default {
  name: 'parenthesized expression in return',
  lines: ['function calculate(a, b) {', '  return (a + b);', '}'],
  selectionLine: 1,
  variableName: 'a',
  expected: 1, // Before the return statement
};
