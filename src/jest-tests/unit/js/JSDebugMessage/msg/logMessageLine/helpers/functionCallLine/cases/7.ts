export default {
  name: 'template literal passed as argument',
  lines: ['const query = send(`', '  SELECT *', '  FROM users', '`);'],
  selectionLine: 0,
  variableName: 'query',
  expectedLine: 4,
};
