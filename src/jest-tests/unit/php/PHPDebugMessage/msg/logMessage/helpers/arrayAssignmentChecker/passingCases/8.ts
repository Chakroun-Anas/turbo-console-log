export default {
  name: 'array inside function',
  fileExtension: '.php',
  lines: [
    '<?php',
    'function getData() {',
    '  $list = [1, 2, 3];',
    '  return $list;',
    '}',
  ],
  selectionLine: 2,
  variableName: '$list',
};
