import type { WithinConditionBlockCheckerTestCase } from '../types';

export const failingCase3: WithinConditionBlockCheckerTestCase = {
  name: 'variable in if body (not condition) should not match',
  fileExtension: 'php',
  lines: ['<?php', 'if (true) {', '    $result = $value;', '}'],
  selectionLine: 2,
  variableName: '$value',
};
