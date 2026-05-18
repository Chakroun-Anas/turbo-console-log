import type { WithinConditionBlockLineTestCase } from '../types';

export const case1: WithinConditionBlockLineTestCase = {
  name: 'should insert before start of if block',
  fileExtension: 'php',
  lines: ['<?php', 'if ($isActive) {', '    echo "Active";', '}'],
  selectionLine: 1,
  variableName: '$isActive',
  expectedLine: 1,
};
