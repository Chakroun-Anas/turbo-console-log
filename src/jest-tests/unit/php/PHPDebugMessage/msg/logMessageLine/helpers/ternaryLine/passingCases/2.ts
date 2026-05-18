import type { TernaryLineTestCase } from '../types';

export const passingCase2: TernaryLineTestCase = {
  name: 'ternary with variables',
  fileExtension: 'php',
  lines: ['<?php', '$value = $condition ? $trueValue : $falseValue;'],
  selectionLine: 1,
  variableName: '$value',
  expectedLine: 2,
};
