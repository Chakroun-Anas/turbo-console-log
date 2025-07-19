// Expression statement in block
export default {
  name: 'expression statement in block',
  lines: [
    'function useVariable(value) {',
    '  return (() => { value; return 1; })();',
    '}',
  ],
  selectionLine: 1,
  variableName: 'value',
  expected: 1, // Before the return statement
};
