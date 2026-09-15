export default {
  fileExtension: '.ts',
  name: 'nested expression-bodied arrows: only the arrow binding the parameter is rewritten',
  lines: ['const grid = rows.map((row) => row.map((cell) => cell * 2));'],
  selectedVar: 'cell',
  line: 0,
  debuggingMsg: 'console.log("DEBUG")',
  expected: [
    'const grid = rows.map((row) => row.map((cell) => {',
    '  console.log("DEBUG");',
    '  return cell * 2;',
    '}));',
  ],
};
