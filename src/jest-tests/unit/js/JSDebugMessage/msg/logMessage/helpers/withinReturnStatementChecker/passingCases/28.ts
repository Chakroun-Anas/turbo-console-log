export default {
  name: 'recursively checked child nodes',
  fileExtension: '.ts',
  lines: [
    'function test() {',
    '  const value = 42;',
    '  return { nested: { deep: { value } } };',
    '}',
  ],
  selectionLine: 2,
  variableName: 'value',
};
