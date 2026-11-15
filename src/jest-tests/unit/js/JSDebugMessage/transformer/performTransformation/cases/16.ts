export default {
  fileExtension: '.js',
  name: 'wrapped log in an opened empty function: all three lines sit at the body indent',
  lines: ['function touch(file) {}'],
  selectedVar: 'file',
  line: 0,
  debuggingMsg: [
    'console.log("-----");',
    'console.log("file", file);',
    'console.log("-----");',
  ].join('\n'),
  expected: [
    'function touch(file) {',
    '  console.log("-----");',
    '  console.log("file", file);',
    '  console.log("-----");',
    '}',
  ],
};
