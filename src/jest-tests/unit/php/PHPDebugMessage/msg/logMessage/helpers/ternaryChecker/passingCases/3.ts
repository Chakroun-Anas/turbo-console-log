import type { TernaryCheckerTestCase } from '../types';

export const passingCase3: TernaryCheckerTestCase = {
  name: 'nested ternary assignment',
  fileExtension: 'php',
  lines: ['<?php', '$grade = $score >= 90 ? "A" : ($score >= 80 ? "B" : "C");'],
  selectionLine: 1,
  variableName: '$grade',
};
