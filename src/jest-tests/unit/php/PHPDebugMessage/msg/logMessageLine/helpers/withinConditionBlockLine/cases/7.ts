import type { WithinConditionBlockLineTestCase } from '../types';

export const case7: WithinConditionBlockLineTestCase = {
  name: 'should insert before if with function call in condition',
  fileExtension: 'php',
  lines: ['<?php', 'if (isset($data)) {', '    echo $data;', '}'],
  selectionLine: 1,
  variableName: '$data',
  expectedLine: 1,
};
