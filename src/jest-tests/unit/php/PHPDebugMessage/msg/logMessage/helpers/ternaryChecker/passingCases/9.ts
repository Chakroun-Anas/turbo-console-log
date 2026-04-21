import type { TernaryCheckerTestCase } from '../types';

export const passingCase9: TernaryCheckerTestCase = {
  name: 'multi-line ternary assignment',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$result = $condition',
    '    ? $trueValue',
    '    : $falseValue;',
  ],
  selectionLine: 1,
  variableName: '$result',
};
