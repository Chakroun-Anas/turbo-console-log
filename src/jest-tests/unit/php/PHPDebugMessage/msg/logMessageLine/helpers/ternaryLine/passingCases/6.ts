import type { TernaryLineTestCase } from '../types';

export const passingCase6: TernaryLineTestCase = {
  name: 'multi-line ternary assignment (3 lines)',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$result = $condition',
    '    ? $trueValue',
    '    : $falseValue;',
  ],
  selectionLine: 1,
  variableName: '$result',
  expectedLine: 4,
};
