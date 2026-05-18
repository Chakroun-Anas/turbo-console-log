import type { TernaryCheckerTestCase } from '../types';

export const failingCase5: TernaryCheckerTestCase = {
  name: 'null coalescing operator should not match',
  fileExtension: 'php',
  lines: ['<?php', '$value = $input ?? $default;'],
  selectionLine: 1,
  variableName: '$value',
};
