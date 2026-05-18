import type { WithinConditionBlockLineTestCase } from '../types';

export const case8: WithinConditionBlockLineTestCase = {
  name: 'should insert before if with complex logical operators',
  fileExtension: 'php',
  lines: [
    '<?php',
    'if ($user && $user->isActive() && $hasPermission) {',
    '    echo "Authorized";',
    '}',
  ],
  selectionLine: 1,
  variableName: '$hasPermission',
  expectedLine: 1,
};
