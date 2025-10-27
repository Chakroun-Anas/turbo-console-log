export default {
  name: 'complex binary expression, cursor in middle',
  fileExtension: '.ts',
  lines: [
    'const status =',
    '  (a && b) ||',
    '  (c === d && e !== f);',
    'console.log(status);',
  ],
  selectionLine: 0,
  variableName: 'status',
  expectedLine: 3,
};
