export default {
  fileExtension: '.ts',
  name: 'object destructuring single line',
  lines: [
    'function test() {',
    '  const { user } = state;',
    '  return user;',
    '}',
  ],
  selectionLine: 1,
  variableName: 'user',
  expectedLine: 2,
};
