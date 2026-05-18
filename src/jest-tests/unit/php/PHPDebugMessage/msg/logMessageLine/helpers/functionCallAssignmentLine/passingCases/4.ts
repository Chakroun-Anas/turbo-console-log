import type { FunctionCallAssignmentLineTestCase } from '../types';

export default {
  name: 'multi-line function call with closing parenthesis on different line',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$result = calculateTotal(',
    '  $price,',
    '  $quantity,',
    '  $taxRate',
    ');',
  ],
  selectionLine: 1,
  variableName: '$result',
  expectedLine: 6,
} satisfies FunctionCallAssignmentLineTestCase;
