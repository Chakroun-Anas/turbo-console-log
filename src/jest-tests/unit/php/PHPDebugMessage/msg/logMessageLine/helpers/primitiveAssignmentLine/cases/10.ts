export default {
  fileExtension: '.php',
  name: 'multi-line string literal',
  lines: [
    '<?php',
    '$message = "This is a long message',
    'that spans multiple',
    'lines in the source code";',
    'echo $message;',
  ],
  selectionLine: 1,
  variableName: '$message',
  expectedLine: 4,
};
