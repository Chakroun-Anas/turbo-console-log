export default {
  fileExtension: '.ts',
  name: 'shorthand property in a returned object literal (no root variable)',
  lines: ['function toDto(id, name) {', '  return { id, name };', '}'],
  selectionLine: 1,
  variableName: 'id',
  // Same anchor as case 5: after the `return` the log would never run.
  expectedLine: 1,
};
