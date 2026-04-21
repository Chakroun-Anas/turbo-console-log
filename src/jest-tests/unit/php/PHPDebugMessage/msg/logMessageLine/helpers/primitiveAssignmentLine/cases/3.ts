export default {
  fileExtension: '.php',
  name: 'assignment inside if statement',
  lines: [
    '<?php',
    'if ($condition) {',
    '  $isActive = true;',
    '  doSomething();',
    '}',
  ],
  selectionLine: 2,
  variableName: '$isActive',
  expectedLine: 3,
};
