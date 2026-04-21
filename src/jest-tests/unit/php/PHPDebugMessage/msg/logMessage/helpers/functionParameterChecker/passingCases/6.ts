import type { FunctionParameterCheckerTestCase } from '../types';

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
} satisfies FunctionParameterCheckerTestCase;
