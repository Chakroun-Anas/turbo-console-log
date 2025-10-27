export default {
  fileExtension: '.ts',
  name: 'arrow function with implicit return',
  lines: ['const double = (x) => x * 2;'],
  selectedVar: 'x',
  line: 0,
  debuggingMsg: 'console.log("DEBUG")',
  expected: [
    'const double = (x) => {',
    '  console.log("DEBUG");',
    '  return x * 2;',
    '};',
  ],
};
