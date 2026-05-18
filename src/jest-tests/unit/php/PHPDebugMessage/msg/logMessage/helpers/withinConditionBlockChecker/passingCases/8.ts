import type { WithinConditionBlockCheckerTestCase } from '../types';

export const passingCase8: WithinConditionBlockCheckerTestCase = {
  name: 'variable in do-while condition',
  fileExtension: 'php',
  lines: ['<?php', 'do {', '    echo $value;', '} while ($value < 10);'],
  selectionLine: 3,
  variableName: '$value',
};
