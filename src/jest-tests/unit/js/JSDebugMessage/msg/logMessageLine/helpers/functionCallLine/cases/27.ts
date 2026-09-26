export default {
  fileExtension: '.ts',
  name: 'multi-line optional-chained call declaration - after the statement',
  lines: ['const v = obj?.method?.(', '  arg,', ');', 'use(v);'],
  selectionLine: 0,
  variableName: 'v',
  expectedLine: 3,
};
