export default {
  name: 'array destructured parameter with skipped element',
  lines: [
    'const processData = ([, second, third]) => {',
    '  console.log(second, third);',
    '};',
  ],
  selectionLine: 0,
  variableName: 'second',
};
