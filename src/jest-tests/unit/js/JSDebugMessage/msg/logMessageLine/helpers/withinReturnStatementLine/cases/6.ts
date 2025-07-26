// Template literal in return
export default {
  name: 'template literal in return',
  lines: [
    'function getGreeting(user) {',
    '  return `Hello ${user.name}, welcome!`;',
    '}',
  ],
  selectionLine: 1,
  variableName: 'user.name',
  expected: 1, // Before the return statement
};
