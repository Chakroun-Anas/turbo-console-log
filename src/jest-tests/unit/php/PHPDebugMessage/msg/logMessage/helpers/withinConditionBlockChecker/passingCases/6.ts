import type { WithinConditionBlockCheckerTestCase } from '../types';

export const passingCase6: WithinConditionBlockCheckerTestCase = {
  name: 'variable in ternary condition',
  fileExtension: 'php',
  lines: ['<?php', '$result = $isValid ? "yes" : "no";'],
  selectionLine: 1,
  variableName: '$isValid',
};
