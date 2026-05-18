import type { WithinConditionBlockCheckerTestCase } from '../types';

export const failingCase4: WithinConditionBlockCheckerTestCase = {
  name: 'variable in return statement should not match',
  fileExtension: 'php',
  lines: ['<?php', 'function get() {', '    return $value;', '}'],
  selectionLine: 2,
  variableName: '$value',
};
