export default {
  fileExtension: '.php',
  name: 'assignment inside nested blocks',
  lines: [
    '<?php',
    'class User {',
    '  public function process() {',
    '    if ($this->isValid()) {',
    "      $name = 'John';",
    '      return $name;',
    '    }',
    '  }',
    '}',
  ],
  selectionLine: 4,
  variableName: '$name',
  expectedLine: 5,
};
