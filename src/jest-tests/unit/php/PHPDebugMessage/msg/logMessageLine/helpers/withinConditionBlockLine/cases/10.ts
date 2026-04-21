import type { WithinConditionBlockLineTestCase } from '../types';

export const case10: WithinConditionBlockLineTestCase = {
  name: 'should insert before if with array access',
  fileExtension: 'php',
  lines: ['<?php', 'if ($config["enabled"]) {', '    runTask();', '}'],
  selectionLine: 1,
  variableName: '$config',
  expectedLine: 1,
};
