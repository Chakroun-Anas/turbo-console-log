// Variable is function parameter, not external variable
export default {
  name: 'variable is function parameter',
  lines: [
    'function processValue(value) {',
    '  return (input) => input + value;',
    '}',
  ],
  selectionLine: 1,
  variableName: 'input', // 'input' is a parameter of the inner function
};
