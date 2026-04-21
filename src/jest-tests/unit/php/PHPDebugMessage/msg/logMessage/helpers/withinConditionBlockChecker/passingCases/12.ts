import type { WithinConditionBlockCheckerTestCase } from '../types';

export const passingCase12: WithinConditionBlockCheckerTestCase = {
  name: 'variable in if condition with function call',
  fileExtension: 'php',
  lines: ['<?php', 'if (isset($data)) {', '    echo $data;', '}'],
  selectionLine: 1,
  variableName: '$data',
};
