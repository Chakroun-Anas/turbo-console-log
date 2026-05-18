import type { WithinConditionBlockCheckerTestCase } from '../types';

export const passingCase10: WithinConditionBlockCheckerTestCase = {
  name: 'variable in nested if condition',
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
};
