import type { WithinConditionBlockCheckerTestCase } from '../types';

export const passingCase11: WithinConditionBlockCheckerTestCase = {
  name: 'variable in if condition with comparison',
  fileExtension: 'php',
  lines: ['<?php', 'if ($count === 0) {', '    echo "Empty";', '}'],
  selectionLine: 1,
  variableName: '$count',
};
