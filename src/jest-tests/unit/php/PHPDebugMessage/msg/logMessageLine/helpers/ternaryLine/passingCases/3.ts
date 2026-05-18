import type { TernaryLineTestCase } from '../types';

export const passingCase3: TernaryLineTestCase = {
  name: 'nested ternary assignment',
  fileExtension: 'php',
  lines: ['<?php', '$grade = $score >= 90 ? "A" : ($score >= 80 ? "B" : "C");'],
  selectionLine: 1,
  variableName: '$grade',
  expectedLine: 2,
};
