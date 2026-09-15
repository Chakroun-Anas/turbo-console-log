export default {
  name: 'identifier logically assigned (||=) to a multi-line awaited call',
  fileExtension: '.js',
  lines: [
    'async function getConnection() {',
    '  connection ||= await mysql.createConnection({',
    '    uri: process.env.DATABASE_URL,',
    '  });',
    '  return connection;',
    '}',
  ],
  selectionLine: 1,
  variableName: 'connection',
};
