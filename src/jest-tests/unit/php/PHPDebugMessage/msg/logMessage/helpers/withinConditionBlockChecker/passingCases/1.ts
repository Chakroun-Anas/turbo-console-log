import type { WithinConditionBlockCheckerTestCase } from '../types';

export const passingCase1: WithinConditionBlockCheckerTestCase = {
  name: 'variable in if condition',
  fileExtension: 'php',
  lines: ['<?php', 'if ($isActive) {', '    echo "Active";', '}'],
  selectionLine: 1,
  variableName: '$isActive',
};
