// Shorthand property assignment in object literal
export default {
  name: 'shorthand property assignment in return',
  lines: [
    'function createUser(name) {',
    '  return { name, active: true };',
    '}',
  ],
  selectionLine: 1,
  variableName: 'name',
  expected: 1, // Before the return statement
};
