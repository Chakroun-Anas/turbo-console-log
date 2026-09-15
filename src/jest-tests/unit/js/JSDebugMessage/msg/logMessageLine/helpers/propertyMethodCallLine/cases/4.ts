export default {
  name: 'should return the if statement line when the object is in its condition',
  fileExtension: '.ts',
  lines: [
    'function guard(user) {',
    "  if (!user.roles.includes('admin')) {",
    '    return false;',
    '  }',
    '  return true;',
    '}',
  ],
  selectionLine: 1,
  selectedText: 'user.roles',
  expectedLine: 1,
};
