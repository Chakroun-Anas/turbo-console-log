export default {
  name: 'nested ternary inside assignment',
  fileExtension: '.ts',
  lines: [
    'const output = cond1',
    "  ? (cond2 ? 'A' : 'B')",
    "  : 'C';",
    'console.log(output);',
  ],
  selectionLine: 0,
  variableName: 'output',
  expectedLine: 3,
};
