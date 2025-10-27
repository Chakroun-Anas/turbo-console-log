export default {
  name: 'parenthesized expression',
  fileExtension: '.ts',
  lines: [
    'function test() {',
    '  // pre-comment',
    '  const val = (x + y);',
    '  return val;',
    '}',
  ],
  selectionLine: 2,
  variableName: 'val',
  expectedLine: 3,
};
