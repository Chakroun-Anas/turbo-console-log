// Function expression in return
export default {
  name: 'function expression in return',
  lines: [
    'function createHandler(config) {',
    '  return function(event) { return event.data; };',
    '}',
  ],
  selectionLine: 1,
  variableName: 'event.data',
};
