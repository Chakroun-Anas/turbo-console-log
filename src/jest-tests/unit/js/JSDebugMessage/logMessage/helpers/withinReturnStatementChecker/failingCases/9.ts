// Variable in assignment that happens to be near return statement
export default {
  name: 'variable in assignment near return',
  lines: [
    'function processData(data) {',
    '  const temp = data.items;',
    '  return "success";',
    '}',
  ],
  selectionLine: 1, // Line with assignment, not return
  variableName: 'data.items',
};
