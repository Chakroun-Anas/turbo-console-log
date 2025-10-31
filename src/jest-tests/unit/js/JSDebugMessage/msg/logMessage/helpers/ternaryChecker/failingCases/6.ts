export default {
  name: 'multiple vars declared, cursor on unrelated one',
  fileExtension: '.ts',
  lines: ['const x = 1,', '      y = cond ? 2 : 3,', '      z = 42;'],
  selectionLine: 0,
  variableName: 'x',
};
