export default {
  name: 'nested functions with same param name',
  lines: [
    'function outer(data) {',
    '  function inner(data) {',
    '    return data;',
    '  }',
    '  return inner(data);',
    '}',
  ],
  selectionLine: 0,
  variableName: 'data',
  expected: 1,
};
