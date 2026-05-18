import type { WithinConditionBlockLineTestCase } from '../types';

export const case11: WithinConditionBlockLineTestCase = {
  name: 'should insert before if with multi-line condition (selecting middle line)',
  fileExtension: 'php',
  lines: [
    '<?php',
    'if (',
    '    $user !== null &&',
    '    $user->isActive() &&',
    '    $hasPermission === true',
    ') {',
    '    grantAccess();',
    '}',
  ],
  selectionLine: 3, // Selecting $user->isActive() on line 3
  variableName: '$user->isActive',
  expectedLine: 1, // Should insert before the if statement
};
