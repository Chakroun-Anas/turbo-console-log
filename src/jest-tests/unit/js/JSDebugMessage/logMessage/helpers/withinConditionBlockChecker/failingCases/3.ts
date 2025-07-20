export default {
  name: 'should not detect property access in ternary condition',
  lines: ['const result = user.isActive ? "active" : "inactive";'],
  selectionLine: 0,
  variableName: 'user.isActive',
  expected: false,
};
