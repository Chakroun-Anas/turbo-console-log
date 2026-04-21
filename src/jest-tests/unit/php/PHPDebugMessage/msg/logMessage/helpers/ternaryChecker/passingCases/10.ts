import type { TernaryCheckerTestCase } from '../types';

export const passingCase10: TernaryCheckerTestCase = {
  name: 'multi-line nested ternary',
  fileExtension: 'php',
  lines: [
    '<?php',
    '$level = $score >= 90',
    '    ? "excellent"',
    '    : ($score >= 70',
    '        ? "good"',
    '        : "needs improvement");',
  ],
  selectionLine: 1,
  variableName: '$level',
};
