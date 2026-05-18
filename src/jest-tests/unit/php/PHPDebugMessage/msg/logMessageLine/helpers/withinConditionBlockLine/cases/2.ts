import type { WithinConditionBlockLineTestCase } from '../types';

export const case2: WithinConditionBlockLineTestCase = {
  name: 'should insert before start of multi-line if block',
  fileExtension: 'php',
  lines: [
    '<?php',
    'if (',
    '    $user->isActive() &&',
    '    $user->hasRole("admin") &&',
    '    $isPremium',
    ') {',
    '    echo "Premium admin";',
    '}',
  ],
  selectionLine: 4,
  variableName: '$isPremium',
  expectedLine: 1,
};
