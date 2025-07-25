export default {
  name: 'named function expression with inner block comment',
  lines: [
    'const log = function log() {',
    '  // log something important',
    '  console.log("inside");',
    '};',
    'log();',
  ],
  selectionLine: 0,
  selectedVar: 'log',
  expectedLine: 4,
};
