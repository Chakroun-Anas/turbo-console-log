export default {
  name: 'expression statement in block',
  lines: [
    'function test() {',
    '  const value = 42;',
    '  return (() => { value; return 1; })();',
    '}',
  ],
  selectionLine: 2,
  variableName: 'value',
};
