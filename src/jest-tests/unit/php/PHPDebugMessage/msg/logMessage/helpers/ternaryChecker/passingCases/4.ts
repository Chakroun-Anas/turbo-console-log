import type { TernaryCheckerTestCase } from '../types';

export const passingCase4: TernaryCheckerTestCase = {
  name: 'ternary with function calls',
  fileExtension: 'php',
  lines: ['<?php', '$data = $isValid ? getData() : getDefaultData();'],
  selectionLine: 1,
  variableName: '$data',
};
