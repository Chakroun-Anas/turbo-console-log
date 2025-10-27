// Variable in complex expression but not in return statement
export default {
  name: 'complex expression outside return',
  fileExtension: '.ts',
  lines: [
    'function processData(data) {',
    '  const result = data.items.map(item => item.value);',
    '  return "processed";',
    '}',
  ],
  selectionLine: 1, // Line with complex expression, not return
  variableName: 'item.value',
};
