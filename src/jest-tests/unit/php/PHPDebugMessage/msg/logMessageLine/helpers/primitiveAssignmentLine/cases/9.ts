export default {
  fileExtension: '.php',
  name: 'assignment after other statements in same block',
  lines: [
    '<?php',
    'function calculate() {',
    '  $x = 5;',
    '  $y = 10;',
    '  $counter = 0;',
    '  return $x + $y;',
    '}',
  ],
  selectionLine: 4,
  variableName: '$counter',
  expectedLine: 5,
};
