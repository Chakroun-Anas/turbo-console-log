export default {
  name: 'arithmetic assignment, single line',
  fileExtension: '.ts',
  lines: ['function test() {', '  const sum = a + b;', '  return sum;', '}'],
  selectionLine: 1,
  variableName: 'sum',
  expectedLine: 2,
};
