import type { WithinReturnStatementLineTestCase } from '../types';

export const passingCase5: WithinReturnStatementLineTestCase = {
  name: 'return with method chaining',
  fileExtension: 'php',
  lines: [
    '<?php',
    'function getResult() {',
    '    return $user->getProfile()->getName();',
    '}',
  ],
  selectionLine: 2,
  variableName: '$user->getProfile()->getName()',
  expectedLine: 2,
};
