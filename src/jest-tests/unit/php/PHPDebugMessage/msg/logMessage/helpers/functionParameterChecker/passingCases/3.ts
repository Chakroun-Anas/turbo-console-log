import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'function parameter with type hint',
  fileExtension: '.php',
  lines: [
    '<?php',
    'function processUser(string $name, int $age) {',
    '  return $name;',
    '}',
  ],
  selectionLine: 1,
  variableName: '$name',
} satisfies FunctionParameterCheckerTestCase;
