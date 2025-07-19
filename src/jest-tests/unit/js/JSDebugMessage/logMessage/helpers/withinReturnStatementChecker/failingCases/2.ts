// Variable in function but not in return
export default {
  name: 'variable in function body but not return',
  lines: [
    'function calculateTotal(items) {',
    '  console.log(items.length);',
    '  return 42;',
    '}',
  ],
  selectionLine: 1, // Line with console.log
  variableName: 'items.length',
};
