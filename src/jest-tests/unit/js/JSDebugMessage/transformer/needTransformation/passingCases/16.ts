export default {
  fileExtension: '.ts',
  name: 'object key returned by an expression-bodied arrow with no other occurrence on the line',
  lines: ['const toDto = (u) => ({', '  id: u.id,', '});', 'use(toDto);'],
  selectionLine: 1,
  variableName: 'id',
};
