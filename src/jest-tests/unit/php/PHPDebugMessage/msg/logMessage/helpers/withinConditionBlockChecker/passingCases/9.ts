import type { WithinConditionBlockCheckerTestCase } from '../types';

export const passingCase9: WithinConditionBlockCheckerTestCase = {
  name: 'variable in multi-line if condition',
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
};
