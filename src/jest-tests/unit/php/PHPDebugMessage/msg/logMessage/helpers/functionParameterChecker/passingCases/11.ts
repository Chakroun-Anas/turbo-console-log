import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'function with parameters spanning multiple lines',
  fileExtension: '.php',
  lines: [
    '<?php',
    'function createUser(',
    '  $name,',
    '  $email,',
    '  $age',
    ') {',
    '  return $name;',
    '}',
  ],
  selectionLine: 1,
  variableName: '$email',
} satisfies FunctionParameterCheckerTestCase;
