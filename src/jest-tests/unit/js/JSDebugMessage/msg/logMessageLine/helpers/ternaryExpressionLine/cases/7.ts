export default {
  name: 'ternary in deeply nested call expression',
  lines: [
    "const value = format(config.useColor ? 'color' : 'mono');",
    'console.log(value);',
  ],
  selectionLine: 0,
  variableName: 'value',
  expectedLine: 1,
};
