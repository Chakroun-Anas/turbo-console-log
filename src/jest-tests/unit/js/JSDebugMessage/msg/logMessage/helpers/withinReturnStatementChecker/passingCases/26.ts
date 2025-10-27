export default {
  name: 'block statement in arrow function',
  fileExtension: '.ts',
  lines: [
    'function test() {',
    '  const value = 42;',
    '  return () => { return value; };',
    '}',
  ],
  selectionLine: 2,
  variableName: 'value',
};
