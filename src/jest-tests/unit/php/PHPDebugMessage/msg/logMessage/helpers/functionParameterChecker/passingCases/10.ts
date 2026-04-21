import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'constructor parameter',
  fileExtension: '.php',
  lines: [
    '<?php',
    'class User {',
    '  public function __construct($name, $email) {',
    '    $this->name = $name;',
    '  }',
    '}',
  ],
  selectionLine: 2,
  variableName: '$name',
} satisfies FunctionParameterCheckerTestCase;
