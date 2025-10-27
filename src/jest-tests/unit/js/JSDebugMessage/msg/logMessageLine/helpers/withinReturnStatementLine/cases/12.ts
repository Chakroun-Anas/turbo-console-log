// Prefix unary expression in return
export default {
  name: 'prefix unary expression in return',
  fileExtension: '.ts',
  lines: ['function getInverted(flag) {', '  return !flag;', '}'],
  selectionLine: 1,
  variableName: 'flag',
  expected: 1, // Before the return statement
};
