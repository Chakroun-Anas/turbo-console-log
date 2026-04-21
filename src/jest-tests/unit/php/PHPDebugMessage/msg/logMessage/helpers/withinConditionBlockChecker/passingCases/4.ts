import type { WithinConditionBlockCheckerTestCase } from '../types';

export const passingCase4: WithinConditionBlockCheckerTestCase = {
  name: 'variable in for condition',
  fileExtension: 'php',
  lines: ['<?php', 'for ($i = 0; $i < $limit; $i++) {', '    echo $i;', '}'],
  selectionLine: 1,
  variableName: '$limit',
};
