import type { TernaryCheckerTestCase } from '../types';

export const failingCase3: TernaryCheckerTestCase = {
  name: 'function call assignment should not match',
  fileExtension: 'php',
  lines: ['<?php', '$result = getData();'],
  selectionLine: 1,
  variableName: '$result',
};
