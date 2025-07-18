export default {
  name: 'parenthesized expression',
  lines: ['// pre-comment', 'const val = (x + y);', 'return val;'],
  selectionLine: 1,
  variableName: 'val',
  expectedLine: 2,
};
