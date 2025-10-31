export default {
  fileExtension: '.ts',
  name: 'function call with comment inside args',
  lines: [
    'const output = transform({',
    '  // this controls the speed',
    '  speed: "fast"',
    '});',
  ],
  selectionLine: 0,
  variableName: 'output',
  expectedLine: 4,
};
