import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'function parameter with variadic operator',
  fileExtension: '.php',
  lines: [
    '<?php',
    'function sum(...$numbers) {',
    '  return array_sum($numbers);',
    '}',
  ],
  selectionLine: 1,
  variableName: '$numbers',
} satisfies FunctionParameterCheckerTestCase;
