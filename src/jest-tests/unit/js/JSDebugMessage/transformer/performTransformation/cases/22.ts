export default {
  fileExtension: '.js',
  name: 'arrow returning a multi-line template literal: its content is not shifted',
  lines: ['const render = (row) => `', '  <li>${row.id}</li>', '`;'],
  selectedVar: 'row',
  line: 0,
  debuggingMsg: '  console.log("row", row);',
  expected: [
    'const render = (row) => {',
    '  console.log("row", row);',
    '  return `',
    '  <li>${row.id}</li>',
    '`;',
    '};',
  ],
};
