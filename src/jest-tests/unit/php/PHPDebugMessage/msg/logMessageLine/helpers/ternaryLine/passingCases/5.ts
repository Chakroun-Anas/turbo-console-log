import type { TernaryLineTestCase } from '../types';

export const passingCase5: TernaryLineTestCase = {
  name: 'ternary with multiple statements on same line after',
  fileExtension: 'php',
  lines: ['<?php', '$result = $condition ? "yes" : "no"; echo $result;'],
  selectionLine: 1,
  variableName: '$result',
  expectedLine: 2,
};
