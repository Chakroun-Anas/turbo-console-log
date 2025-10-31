export default {
  name: 'array destructured parameter with default value',
  fileExtension: '.ts',
  lines: [
    'const init = ([first = 1, second]) => {',
    '  console.log(first, second);',
    '};',
  ],
  selectionLine: 0,
  variableName: 'second',
};
