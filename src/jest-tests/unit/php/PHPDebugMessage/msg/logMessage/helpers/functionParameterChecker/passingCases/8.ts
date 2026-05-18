import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'function parameter with reference',
  fileExtension: '.php',
  lines: [
    '<?php',
    'function modifyValue(&$value) {',
    '  $value = $value * 2;',
    '}',
  ],
  selectionLine: 1,
  variableName: '$value',
} satisfies FunctionParameterCheckerTestCase;
