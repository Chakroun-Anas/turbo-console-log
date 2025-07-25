// Variable in different statement before return
export default {
  name: 'variable in different statement',
  lines: [
    'function process(data) {',
    '  console.log(data.status);',
    '  return true;',
    '}',
  ],
  selectionLine: 1, // Line with console.log, not return
  variableName: 'data.status',
};
