export default {
  fileExtension: '.ts',
  name: 'named function expression assigned to variable',
  lines: [
    'const doStuff = function doStuff() {',
    '  console.log("doing");',
    '};',
    'execute();',
  ],
  selectionLine: 0,
  selectedVar: 'doStuff',
  expectedLine: 3,
};
