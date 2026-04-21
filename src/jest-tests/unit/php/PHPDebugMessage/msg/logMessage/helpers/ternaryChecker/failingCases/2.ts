import type { TernaryCheckerTestCase } from '../types';

export const failingCase2: TernaryCheckerTestCase = {
  name: 'array assignment should not match',
  fileExtension: 'php',
  lines: ['<?php', '$data = ["a", "b", "c"];'],
  selectionLine: 1,
  variableName: '$data',
};
