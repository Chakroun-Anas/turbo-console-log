export default {
  fileExtension: '.ts',
  name: 'identifier assignment',
  lines: ['function test() {', '  const copy = other;', '  return copy;', '}'],
  selectionLine: 1,
  variableName: 'copy',
  expectedLine: 2,
};
