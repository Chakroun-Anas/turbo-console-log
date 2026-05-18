import type { WithinConditionBlockCheckerTestCase } from '../types';

export const failingCase2: WithinConditionBlockCheckerTestCase = {
  name: 'variable in function body (not condition) should not match',
  fileExtension: 'php',
  lines: ['<?php', 'function test() {', '    $result = $value;', '}'],
  selectionLine: 2,
  variableName: '$value',
};
