// Spread assignment in object literal
export default {
  name: 'spread assignment in return',
  lines: [
    'function mergeUser(user, extra) {',
    '  return { ...user, active: true };',
    '}',
  ],
  selectionLine: 1,
  variableName: 'user',
  expected: 1, // Before the return statement
};
