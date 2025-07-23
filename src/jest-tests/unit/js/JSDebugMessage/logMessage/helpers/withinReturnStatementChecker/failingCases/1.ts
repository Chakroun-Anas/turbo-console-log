// Variable in assignment before return statement
export default {
  name: 'variable in assignment before return',
  lines: [
    'function processData(data) {',
    '  const processed = data.value;',
    '  return processed;',
    '}',
  ],
  selectionLine: 1, // Line with assignment, not return
  variableName: 'data.value', // This exists but is in assignment, not return
};
