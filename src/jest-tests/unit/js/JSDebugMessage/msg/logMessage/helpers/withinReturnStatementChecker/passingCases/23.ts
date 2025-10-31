export default {
  name: 'template literal with substitution',
  fileExtension: '.ts',
  lines: [
    'function test() {',
    '  const name = "John";',
    '  return `Hello ${name}`;',
    '}',
  ],
  selectionLine: 2,
  variableName: 'name',
};
