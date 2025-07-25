export default {
  name: 'function expression with complex parameter destructuring',
  lines: [
    'function test() {',
    '  const value = 42;',
    '  return function({ name }) { return value; };',
    '}',
  ],
  selectionLine: 2,
  variableName: 'value',
};
