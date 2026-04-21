import type { WithinConditionBlockCheckerTestCase } from '../types';

export const passingCase3: WithinConditionBlockCheckerTestCase = {
  name: 'variable in while condition',
  fileExtension: 'php',
  lines: ['<?php', 'while ($count < 10) {', '    $count++;', '}'],
  selectionLine: 1,
  variableName: '$count',
};
