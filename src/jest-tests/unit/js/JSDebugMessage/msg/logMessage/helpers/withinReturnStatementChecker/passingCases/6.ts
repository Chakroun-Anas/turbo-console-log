// Ternary expression in return statement
export default {
  name: 'ternary expression in return',
  fileExtension: '.ts',
  lines: [
    'function getStatus(user) {',
    '  return user.isActive ? user.name : "inactive";',
    '}',
  ],
  selectionLine: 1,
  variableName: 'user.name',
};
