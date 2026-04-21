import type { WithinConditionBlockLineTestCase } from '../types';

export const case12: WithinConditionBlockLineTestCase = {
  name: 'should insert before if with multi-line condition (selecting first line)',
  fileExtension: 'php',
  lines: [
    '<?php',
    'if (',
    '    $count > 0 &&',
    '    $limit < 100',
    ') {',
    '    processData();',
    '}',
  ],
  selectionLine: 2, // Selecting $count on line 2 (first line of condition)
  variableName: '$count',
  expectedLine: 1, // Should insert before the if statement
};
