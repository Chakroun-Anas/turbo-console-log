import type { FunctionParameterLineTestCase } from '../types';

export default {
  name: 'class method parameter',
  fileExtension: '.php',
  lines: [
    '<?php',
    'class User {',
    '  public function setName($name) {',
    '    $this->name = $name;',
    '  }',
    '}',
  ],
  selectionLine: 2,
  variableName: '$name',
  expectedLine: 3,
} satisfies FunctionParameterLineTestCase;
