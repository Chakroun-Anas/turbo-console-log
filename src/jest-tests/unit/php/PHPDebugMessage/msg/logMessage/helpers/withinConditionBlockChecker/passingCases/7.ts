import type { WithinConditionBlockCheckerTestCase } from '../types';

export const passingCase7: WithinConditionBlockCheckerTestCase = {
  name: 'variable in complex if condition with logical operators',
  fileExtension: 'php',
  lines: [
    '<?php',
    'if ($user && $user->isActive() && $hasPermission) {',
    '    echo "Authorized";',
    '}',
  ],
  selectionLine: 1,
  variableName: '$hasPermission',
};
