import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'function with multiple parameters',
  fileExtension: '.php',
  lines: [
    '<?php',
    'function calculate($a, $b, $operation) {',
    '  return $a;',
    '}',
  ],
  selectionLine: 1,
  variableName: '$a',
} satisfies FunctionParameterCheckerTestCase;
