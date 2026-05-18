import type { StringInterpolationLineTestCase } from '../types';

export default {
  name: 'multi-line with complex interpolation',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$report = "Report for {$user->getName()}',
    'Total: $total',
    'Status: $status";',
  ],
  selectionLine: 1,
  variableName: '$report',
  expectedLine: 4,
} satisfies StringInterpolationLineTestCase;
