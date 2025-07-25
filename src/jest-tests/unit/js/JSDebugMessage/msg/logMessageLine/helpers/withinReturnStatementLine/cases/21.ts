// Arrow function in return
export default {
  name: 'arrow function in return',
  lines: ['function createHandler(value) {', '  return () => value + 1;', '}'],
  selectionLine: 1,
  variableName: 'value',
  expected: 1, // Before the return statement
};
