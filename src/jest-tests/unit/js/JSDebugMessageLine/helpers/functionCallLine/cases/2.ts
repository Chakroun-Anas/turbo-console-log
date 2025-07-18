export default {
  name: 'chained method call on single line',
  lines: ['const value = user.getProfile().getName();'],
  selectionLine: 0,
  variableName: 'value',
  expectedLine: 1,
};
