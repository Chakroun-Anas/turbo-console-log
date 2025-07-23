export default {
  name: 'variable not a function parameter',
  lines: [
    'const value = 42;',
    'function test() {',
    '  console.log(value);',
    '}',
  ],
  selectionLine: 0,
  variableName: 'value',
};
