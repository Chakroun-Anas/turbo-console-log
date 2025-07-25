// Variable in conditional before return
export default {
  name: 'variable in conditional before return',
  lines: [
    'function processUser(user) {',
    '  if (user.isActive) {',
    '    console.log("Active user");',
    '  }',
    '  return "processed";',
    '}',
  ],
  selectionLine: 1, // Line with conditional check
  variableName: 'user.isActive', // This exists but is in conditional, not return
};
