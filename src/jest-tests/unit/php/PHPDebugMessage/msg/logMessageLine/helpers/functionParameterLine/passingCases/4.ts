import type { FunctionParameterLineTestCase } from '../types';

export default {
  name: 'anonymous function parameter',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$callback = function($item) {',
    '  return $item * 2;',
    '};',
  ],
  selectionLine: 1,
  variableName: '$item',
  expectedLine: 2,
} satisfies FunctionParameterLineTestCase;
