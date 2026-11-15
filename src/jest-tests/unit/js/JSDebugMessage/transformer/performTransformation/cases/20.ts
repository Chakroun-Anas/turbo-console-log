export default {
  fileExtension: '.js',
  name: 'parenthesized object in a file without semicolons: the object lines follow its new indent',
  lines: ['const toDto = (row) => ({', '  id: row.id,', '})'],
  selectedVar: 'row',
  line: 0,
  debuggingMsg: '  console.log("row", row);',
  expected: [
    'const toDto = (row) => {',
    '  console.log("row", row);',
    '  return (',
    '    {',
    '      id: row.id,',
    '    }',
    '  );',
    '}',
  ],
};
