import type { WithinConditionBlockCheckerTestCase } from '../types';

export const failingCase5: WithinConditionBlockCheckerTestCase = {
  name: 'wrong variable name should not match',
  fileExtension: 'php',
  lines: ['<?php', 'if ($isActive) {', '    echo "Active";', '}'],
  selectionLine: 1,
  variableName: '$isInactive',
};
