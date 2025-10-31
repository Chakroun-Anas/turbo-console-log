// Template literal in return statement
export default {
  name: 'template literal in return',
  fileExtension: '.ts',
  lines: [
    'function getGreeting(user) {',
    '  return `Hello ${user.name}, welcome!`;',
    '}',
  ],
  selectionLine: 1,
  variableName: 'user.name',
};
