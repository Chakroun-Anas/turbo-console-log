import type { TernaryCheckerTestCase } from '../types';

export const passingCase12: TernaryCheckerTestCase = {
  name: 'ternary with null coalescing alternative',
  fileExtension: 'php',
  lines: ['<?php', '$value = $input !== null ? $input : $default;'],
  selectionLine: 1,
  variableName: '$value',
};
