import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'class method parameter',
  fileExtension: '.php',
  lines: [
    '<?php',
    'class User {',
    '  public function setName($name) {',
    '    return $name;',
    '  }',
    '}',
  ],
  selectionLine: 2,
  variableName: '$name',
} satisfies FunctionParameterCheckerTestCase;
