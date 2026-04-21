import type { FunctionParameterLineTestCase } from '../types';

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
  expectedLine: 6,
} satisfies FunctionParameterLineTestCase;
