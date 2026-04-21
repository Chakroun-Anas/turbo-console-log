export default {
  fileExtension: '.php',
  name: 'number literal',
  lines: [
    '<?php',
    'function test() {',
    '  $count = 10;',
    '  return $count;',
    '}',
  ],
  selectionLine: 2,
  variableName: '$count',
  expectedLine: 3,
};
