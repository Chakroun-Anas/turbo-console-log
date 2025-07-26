// Ternary expression in return
export default {
  name: 'ternary expression in return',
  lines: [
    'function getStatus(user) {',
    '  return user.isActive ? user.name : "inactive";',
    '}',
  ],
  selectionLine: 1,
  variableName: 'user.name',
  expected: 1, // Before the return statement
};
