export default {
  name: 'arrow function with complex parameter destructuring',
  fileExtension: '.ts',
  lines: [
    'function test() {',
    '  const value = 42;',
    '  return ({ name }) => value + 1;',
    '}',
  ],
  selectionLine: 2,
  variableName: 'value',
};
