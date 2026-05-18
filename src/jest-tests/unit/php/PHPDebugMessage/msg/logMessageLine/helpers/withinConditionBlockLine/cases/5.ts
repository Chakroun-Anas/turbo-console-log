import type { WithinConditionBlockLineTestCase } from '../types';

export const case5: WithinConditionBlockLineTestCase = {
  name: 'should insert before if with comparison',
  fileExtension: 'php',
  lines: ['<?php', 'if ($count === 0) {', '    echo "Empty";', '}'],
  selectionLine: 1,
  variableName: '$count',
  expectedLine: 1,
};
