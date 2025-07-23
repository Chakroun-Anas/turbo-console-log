// Variable not in return statement (fallback case)
export default {
  name: 'variable not in return statement',
  lines: [
    'function processData(data) {',
    '  const processed = data.value;',
    '  return processed;',
    '}',
  ],
  selectionLine: 1, // Line with assignment, not return
  variableName: 'data.value',
  expected: 2, // Falls back to selectionLine + 1
};
