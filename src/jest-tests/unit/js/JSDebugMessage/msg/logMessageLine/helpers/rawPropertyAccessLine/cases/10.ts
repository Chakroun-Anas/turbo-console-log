export default {
  fileExtension: '.ts',
  name: 'key in an object passed to an else-if condition',
  lines: [
    'if (!user) {',
    '  login();',
    '} else if (can(user, {',
    '  role: user.role,',
    '})) {',
    '  open();',
    '}',
  ],
  selectionLine: 3,
  variableName: 'role',
  // Else-if decision: the top of the else-if body.
  expectedLine: 5,
};
