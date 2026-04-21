import type { FunctionCallAssignmentCheckerTestCase } from '../types';

export default {
  name: 'multi-line function call with multiple parameters',
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
} satisfies FunctionCallAssignmentCheckerTestCase;
