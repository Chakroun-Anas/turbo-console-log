export default {
  name: 'ternary in object destructuring',
  fileExtension: '.ts',
  lines: ['const { a = cond ? "a" : "b" } = obj;'],
  selectionLine: 0,
  variableName: 'a',
};
