import type { WithinConditionBlockLineTestCase } from '../types';

export const case6: WithinConditionBlockLineTestCase = {
  name: 'should insert before nested if condition',
  fileExtension: 'php',
  lines: [
    '<?php',
    'if ($user) {',
    '    if ($user->age > 18) {',
    '        echo "Adult";',
    '    }',
    '}',
  ],
  selectionLine: 2,
  variableName: '$user->age',
  expectedLine: 2,
};
