import type { TernaryCheckerTestCase } from '../types';

export const passingCase2: TernaryCheckerTestCase = {
  name: 'ternary with variables',
  fileExtension: 'php',
  lines: ['<?php', '$value = $condition ? $trueValue : $falseValue;'],
  selectionLine: 1,
  variableName: '$value',
};
