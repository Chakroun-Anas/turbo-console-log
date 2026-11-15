export default {
  fileExtension: '.js',
  name: 'arrow returning a multi-line array: the array moves one level deeper',
  lines: [
    'const pairs = rows.map((row) => [',
    '  row.id,',
    '  row.name,',
    ']);',
  ],
  selectedVar: 'row',
  line: 0,
  debuggingMsg: '  console.log("row", row);',
  expected: [
    'const pairs = rows.map((row) => {',
    '  console.log("row", row);',
    '  return [',
    '    row.id,',
    '    row.name,',
    '  ];',
    '});',
  ],
};
