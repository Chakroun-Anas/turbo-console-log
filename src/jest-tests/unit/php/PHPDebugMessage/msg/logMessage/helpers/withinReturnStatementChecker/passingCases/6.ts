import type { WithinReturnStatementCheckerTestCase } from '../types';

export const passingCase6: WithinReturnStatementCheckerTestCase = {
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
};
