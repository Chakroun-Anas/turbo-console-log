export default {
  fileExtension: '.php',
  name: 'negative number',
  lines: [
    '<?php',
    'class Calculator {',
    '  public function test() {',
    '    $temp = -10;',
    '    return $temp;',
    '  }',
    '}',
  ],
  selectionLine: 3,
  variableName: '$temp',
  expectedLine: 4,
};
