export default {
  name: 'multi-line no-substitution template literal',
  lines: ['const query = `SELECT *', 'FROM users', 'WHERE id = 1`;'],
  selectionLine: 0,
  variableName: 'query',
};
