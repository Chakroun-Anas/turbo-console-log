export default {
  name: 'bracket-first continuation',
  lines: ['const first = list', '  [0].title;', 'console.log(first);'],
  fileExtension: '.ts',
  selectionLine: 0,
  variableName: 'first',
  expectedLine: 2,
};
