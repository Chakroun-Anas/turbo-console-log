export default {
  fileExtension: '.php',
  name: 'assignment inside loop',
  lines: [
    '<?php',
    'foreach ($items as $item) {',
    '  $value = null;',
    '  process($value);',
    '}',
  ],
  selectionLine: 2,
  variableName: '$value',
  expectedLine: 3,
};
