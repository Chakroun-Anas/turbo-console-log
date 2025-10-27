export default {
  name: 'binary with type annotation',
  fileExtension: '.ts',
  lines: ['const total: number = price * quantity;', 'console.log(total);'],
  selectionLine: 0,
  variableName: 'total',
  expectedLine: 1,
};
