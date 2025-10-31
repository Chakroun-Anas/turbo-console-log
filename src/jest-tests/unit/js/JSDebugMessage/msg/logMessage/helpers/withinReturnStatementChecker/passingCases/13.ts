// Postfix unary expression in return (increment)
export default {
  name: 'postfix unary expression in return',
  fileExtension: '.ts',
  lines: [
    'function incrementCounter(state) {',
    '  return state.counter++;',
    '}',
  ],
  selectionLine: 1,
  variableName: 'state.counter',
};
