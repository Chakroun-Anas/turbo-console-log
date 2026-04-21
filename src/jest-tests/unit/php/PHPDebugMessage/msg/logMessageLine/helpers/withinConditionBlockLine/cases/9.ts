import type { WithinConditionBlockLineTestCase } from '../types';

export const case9: WithinConditionBlockLineTestCase = {
  name: 'should insert before if statement within function',
  fileExtension: 'php',
  lines: [
    '<?php',
    'function validateUser($user) {',
    '    if ($user->isValid()) {',
    '        return true;',
    '    }',
    '    return false;',
    '}',
  ],
  selectionLine: 2,
  variableName: '$user->isValid',
  expectedLine: 2,
};
