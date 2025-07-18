export default {
  name: 'breaks on new assignment',
  lines: ['const a = obj.prop;', 'const b = 42;'],
  selectionLine: 0,
  variableName: 'a',
  expectedLine: 1,
};
