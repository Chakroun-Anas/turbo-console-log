export default {
  name: 'alias destructuring with default ternary',
  fileExtension: '.ts',
  lines: ['const { apiKey: key = cond ? "yes" : "no" } = obj;'],
  selectionLine: 0,
  variableName: 'key',
};
