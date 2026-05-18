import type { TernaryLineTestCase } from '../types';

export const passingCase7: TernaryLineTestCase = {
  name: 'multi-line nested ternary (5 lines)',
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
  expectedLine: 6,
};
