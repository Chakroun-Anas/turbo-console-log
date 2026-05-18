import type { TernaryCheckerTestCase } from '../types';

export const passingCase13: TernaryCheckerTestCase = {
  name: 'ternary with numeric operations',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$price = $discount > 0 ? $original - $discount : $original;',
  ],
  selectionLine: 1,
  variableName: '$price',
};
