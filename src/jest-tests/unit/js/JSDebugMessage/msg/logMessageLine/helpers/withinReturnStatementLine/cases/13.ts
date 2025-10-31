// Postfix unary expression in return
export default {
  name: 'postfix unary expression in return',
  fileExtension: '.ts',
  lines: ['function incrementAndReturn(counter) {', '  return counter++;', '}'],
  selectionLine: 1,
  variableName: 'counter',
  expected: 1, // Before the return statement
};
