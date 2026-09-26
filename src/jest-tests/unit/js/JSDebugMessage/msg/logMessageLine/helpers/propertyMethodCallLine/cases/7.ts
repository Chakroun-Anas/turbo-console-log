export default {
  name: 'should return the top of the else-if body when the object is in the else-if condition',
  fileExtension: '.ts',
  lines: [
    'function route(user) {',
    '  if (!user) {',
    '    return login();',
    "  } else if (user.roles.includes('admin')) {",
    '    return admin();',
    '  }',
    '  return home();',
    '}',
  ],
  selectionLine: 3,
  selectedText: 'user.roles',
  expectedLine: 4,
};
