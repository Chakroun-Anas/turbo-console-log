export default {
  fileExtension: '.js',
  name: 'multi-line call logically assigned (||=) to an identifier - after the statement',
  lines: [
    'let client;',
    'client ||= createClient({',
    '  url,',
    '});',
    'use(client);',
  ],
  selectionLine: 1,
  variableName: 'client',
  expectedLine: 4,
};
