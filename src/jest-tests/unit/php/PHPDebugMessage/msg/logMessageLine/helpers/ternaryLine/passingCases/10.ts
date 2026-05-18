import type { TernaryLineTestCase } from '../types';

export const passingCase10: TernaryLineTestCase = {
  name: 'multi-line ternary inside function (6 lines)',
  fileExtension: 'php',
  lines: [
    '<?php',
    'function calculateDiscount($amount, $isMember) {',
    '    $discount = $isMember',
    '        ? $amount * 0.1',
    '        : 0;',
    '    return $discount;',
    '}',
  ],
  selectionLine: 2,
  variableName: '$discount',
  expectedLine: 5,
};
