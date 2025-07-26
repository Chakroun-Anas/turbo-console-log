export default {
  name: 'multi-line object passed to function',
  lines: [
    'const result = doSomething({',
    '  key: "value",',
    '  debug: true',
    '});',
  ],
  selectionLine: 0,
  variableName: 'result',
  expectedLine: 4,
};
