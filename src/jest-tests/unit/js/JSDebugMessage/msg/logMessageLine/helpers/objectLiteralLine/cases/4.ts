export default {
  name: 'multi-line object literal – with closing on new line',
  fileExtension: '.ts',
  lines: ['const config = {', "  theme: 'light',", '  darkMode: true', '};'],
  selectionLine: 0,
  variableName: 'config',
  expectedLine: 4,
};
