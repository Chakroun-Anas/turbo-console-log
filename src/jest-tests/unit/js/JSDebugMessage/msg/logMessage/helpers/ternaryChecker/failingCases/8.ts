export default {
  name: 'destructured alias, but targeting wrong alias',
  fileExtension: '.ts',
  lines: ['const { apiKey: key = cond ? "yes" : "no" } = obj;'],
  selectionLine: 0,
  variableName: 'apiKey', // Wrong focus: it's bound to 'key'
};
