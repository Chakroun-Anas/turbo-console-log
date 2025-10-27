export default {
  name: 'should insert before single statement for if without braces',
  lines: [
    'function test() {',
    '  if (user.isActive)',
    '    return "active";',
    '}',
  ],
  selectionLine: 1,
  fileExtension: '.ts',
  variableName: 'user.isActive',
  expectedLine: 1,
};
